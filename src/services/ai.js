/**
 * HackLens - AI Service
 * Handles OpenRouter API integration for generating summaries
 * 
 * OUTPUT QUALITY RULES:
 * - Professional tone (senior technical analyst style)
 * - No redundant system phrases
 * - No placeholder language
 * - No information repetition across sections
 * - Polished, trustworthy output
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * System prompt for the AI model - produces polished intelligence briefs
 */
const SYSTEM_PROMPT = `You are a senior technical analyst writing repository intelligence briefs.

Your output is shown directly to team leads and decision-makers.
Write as a professional analyst — NOT as an AI system.

========================
WRITING STYLE
========================

- Professional and neutral tone
- Concise and informative
- No system-like language ("I analyzed...", "Based on the data...")
- No disclaimers or hedging
- No meta-references ("Notion context included", "GitHub shows...")
- Reads like a technical brief, not a chat response

========================
MANDATORY TEXT RULES
========================

1. REMOVE REDUNDANT PHRASES
- Never write: "Notion context included: <title>"
- Never write: "Project intent and planning from Notion"
- Never write: "Based on the GitHub data..."
- Never write: "The repository shows..."

2. CONTRIBUTOR WORDING
- If bots were excluded: "X contributors" (state bot exclusion separately)
- If bot count is 0: "X contributors"
- Do NOT say "human contributors" unless specifically contrasting with bots
- Neutral phrasing: "79 contributors" or "79 contributors (excluding automated accounts)"

3. NO INFORMATION REPETITION
- Each section covers DISTINCT information
- Do NOT repeat future plans in both Notion Summary AND Development Story
- Do NOT repeat contributor counts in multiple sections
- Mention roadmap/vision in Notion Summary ONLY

4. SECTION FOCUS
- Repository Overview: What it is, who it's for
- Notion Summary: Vision, intent, future direction (NOT activity)
- Development Story: How it evolved, technical changes (NOT vision)
- Contributors: Who contributed, focus areas
- Code Changes: Where changes occurred

========================
OUTPUT FORMAT
========================

Return a valid JSON object:

{
  "repository_purpose": "2-3 sentences. What the project is. Primary goal. Target audience. High-level scope.",
  
  "notion_summary": "3-4 substantive sentences about project vision, design philosophy, or future direction from Notion. Must add value beyond GitHub data. null if no Notion provided.",
  
  "contributors_summary": "State contributor count once. Top 2-3 contributors with focus areas. Mention bot exclusion if applicable. No duplicate names.",
  
  "change_summary": "2-3 sentences. Most active areas. New vs modified files. Development concentration.",
  
  "development_narrative": "3-5 sentences. How the codebase evolved. Nature of changes (features, refactors, fixes). Collaboration patterns. Do NOT repeat vision/roadmap from Notion Summary."
}

========================
FORBIDDEN OUTPUTS
========================

- "Notion context included"
- "Project intent and planning from Notion"
- "Based on the analysis..."
- "The data shows..."
- Repeating the same fact in multiple sections
- Placeholder or generic descriptions
- System-like language

========================
QUALITY CHECK
========================

Before outputting, verify:
✓ No redundant phrases
✓ No information repeated across sections
✓ Notion Summary is substantive (not placeholder)
✓ Development Story focuses on evolution, not vision
✓ Professional analyst tone throughout
✓ Readable in under 2 minutes`;

/**
 * Builds the analysis prompt with repository data and optional Notion context
 * @param {Object} data - Structured GitHub data
 * @param {Object} notionContext - Optional Notion context
 * @returns {string} - Formatted prompt
 */
function buildAnalysisPrompt(data, notionContext = null) {
    const { rawData, repositoryOverview, contributors, changeSummary, bots } = data;
    
    // Build repository context
    const repoContext = `
========================
REPOSITORY METADATA
========================
Repository: ${rawData.repoInfo.owner}/${rawData.repoInfo.repo}
Description: ${repositoryOverview?.description || 'No description provided'}
Primary Language: ${repositoryOverview?.primaryLanguage || 'Not specified'}
Topics: ${repositoryOverview?.topics?.join(', ') || 'None'}
Stars: ${repositoryOverview?.stars || 0}
Created: ${repositoryOverview?.createdAt || 'Unknown'}

README (first 500 chars):
${repositoryOverview?.readme?.substring(0, 500) || 'No README available'}
`;

    // Build contributor context (deduplicated by login - AUTHORITATIVE)
    const seenLogins = new Set();
    const uniqueContributors = contributors.filter(c => {
        if (seenLogins.has(c.login)) return false;
        seenLogins.add(c.login);
        return true;
    });

    const humanCount = rawData.totalContributorsHuman;
    const botCount = rawData.totalBots;

    const contributorContext = `
========================
CONTRIBUTOR DATA (AUTHORITATIVE - USE THESE EXACT COUNTS)
========================
HUMAN CONTRIBUTORS: ${humanCount} (use this exact number)
BOT ACCOUNTS: ${botCount} (excluded from human count)
${bots?.length > 0 ? `Bot names: ${bots.map(b => b.login).join(', ')} - mention these as "automated accounts" separately` : 'No bots detected'}

HUMAN CONTRIBUTORS LIST (deduplicated by login - NO DUPLICATES ALLOWED):
${uniqueContributors.slice(0, 15).map(c => 
    `- @${c.login}: ${c.contributions} contributions, focus areas: [${c.mainAreas?.join(', ') || 'various'}]`
).join('\n')}
${uniqueContributors.length > 15 ? `\n... and ${uniqueContributors.length - 15} more human contributors` : ''}

CRITICAL: You must state "${humanCount} human contributors" in your output.
${botCount > 0 ? `CRITICAL: Mention that ${botCount} automated account(s) were excluded.` : ''}
`;

    // Build change context
    const changeContext = `
========================
CODE CHANGE STATISTICS
========================
Total Commits: ${changeSummary.totalCommits}

Most Changed Folders:
${changeSummary.folderDetails?.slice(0, 8).map(f => 
    `- ${f.folder}: ${f.changeCount} changes`
).join('\n') || 'N/A'}

File Statistics:
- New files: ${changeSummary.newFiles}
- Modified files: ${changeSummary.modifiedFiles}
- Deleted files: ${changeSummary.deletedFiles}
`;

    // Build recent commits context
    const commitsContext = `
========================
RECENT COMMITS (Sample)
========================
${rawData.recentCommits?.slice(0, 10).map(c => 
    `- "${c.message}" by @${c.author}`
).join('\n') || 'N/A'}
`;

    // Build Notion context section (optional)
    let notionSection = '';
    if (notionContext && notionContext.enabled && notionContext.notion_summary) {
        notionSection = `
========================
NOTION CONTENT (SOURCE OF TRUTH FOR INTENT)
========================
Page Title: ${notionContext.pageTitle || 'Unknown'}

IMPORTANT: You MUST generate a meaningful notion_summary from this content.
Do NOT just say "Notion context included" - actually summarize it.

NOTION TEXT:
${notionContext.notion_summary}

REQUIRED: Generate 3-4 sentences explaining:
- Project vision or goals
- Design decisions or architecture notes
- Future direction or priorities
- Any context not obvious from GitHub

========================
END NOTION CONTENT
========================
`;
    }

    return `Generate a repository intelligence summary from this data.

${repoContext}
${contributorContext}
${changeContext}
${commitsContext}
${notionSection}
========================
VALIDATION CHECKLIST
========================
- Human contributor count MUST be exactly: ${humanCount}
- Bot accounts excluded: ${botCount}
- NO duplicate contributor names allowed
- NO bots in human contributor list
${notionContext?.notion_summary ? '- notion_summary MUST contain actual content summary (NOT "Notion context included")' : '- notion_summary must be null (no Notion provided)'}

Generate a JSON response with these exact fields:
- repository_purpose
- notion_summary (meaningful content or null)
- contributors_summary (must state "${humanCount} human contributors")
- change_summary
- development_narrative`;
}

/**
 * Generates AI summary using OpenRouter API
 * @param {Object} githubData - Structured GitHub data
 * @param {Object} notionContext - Optional Notion context
 * @returns {Promise<Object>} - AI-generated summary
 */
async function generateSummary(githubData, notionContext = null) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // If no API key, return a basic summary
    if (!apiKey) {
        console.log('[AI] No OpenRouter API key found, generating basic summary');
        return generateBasicSummary(githubData, notionContext);
    }

    try {
        console.log('[AI] Generating summary with OpenRouter...');
        if (notionContext?.notion_summary) {
            console.log('[AI] Including Notion context in analysis');
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://hacklens.local',
                'X-Title': 'HackLens Intelligence Tool'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: buildAnalysisPrompt(githubData, notionContext) }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI] OpenRouter API error:', errorText);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No content in AI response');
        }

        // Parse the JSON response from AI
        const aiResponse = parseAIResponse(content);
        
        console.log('[AI] Summary generated successfully');
        
        // Build result with distinct Notion summary field
        const summaryResult = {
            repositoryPurpose: aiResponse.repository_purpose || generateBasicPurpose(githubData),
            notionSummary: aiResponse.notion_summary || null,
            contributorsSummary: aiResponse.contributors_summary || 'Unable to generate contributor summary.',
            changeSummary: aiResponse.change_summary || 'Unable to generate change summary.',
            developmentNarrative: aiResponse.development_narrative || 'Unable to generate development narrative.'
        };
        
        // Log if Notion summary was generated
        if (summaryResult.notionSummary) {
            console.log('[AI] Notion summary generated as distinct section');
        }
        
        return summaryResult;

    } catch (error) {
        console.error('[AI] Error generating summary:', error);
        // Fall back to basic summary
        return generateBasicSummary(githubData, notionContext);
    }
}

/**
 * Parses AI response content to extract JSON
 * @param {string} content - Raw AI response content
 * @returns {Object} - Parsed JSON object
 */
function parseAIResponse(content) {
    // Try direct JSON parse first
    try {
        return JSON.parse(content);
    } catch (e) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1].trim());
            } catch (e2) {
                // Continue to fallback
            }
        }

        // Try to find JSON object in the response
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            try {
                return JSON.parse(objectMatch[0]);
            } catch (e3) {
                // Continue to fallback
            }
        }

        // Return empty object as fallback
        console.warn('[AI] Could not parse AI response as JSON');
        return {};
    }
}

/**
 * Generates a basic repository purpose description
 * @param {Object} githubData - Structured GitHub data
 * @returns {string} - Basic purpose description
 */
function generateBasicPurpose(githubData) {
    const { repositoryOverview, changeSummary } = githubData;
    
    let purpose = '';
    
    if (repositoryOverview?.description) {
        purpose = repositoryOverview.description;
    } else if (repositoryOverview?.readme) {
        // Extract first sentence from README
        const firstSentence = repositoryOverview.readme.split(/[.!?]/)[0];
        purpose = firstSentence.trim();
    }
    
    if (repositoryOverview?.primaryLanguage) {
        purpose += ` This is a ${repositoryOverview.primaryLanguage} project.`;
    }
    
    if (repositoryOverview?.topics?.length > 0) {
        purpose += ` Topics: ${repositoryOverview.topics.slice(0, 5).join(', ')}.`;
    }
    
    return purpose || 'Repository purpose could not be determined from available data.';
}

/**
 * Generates a basic summary without AI when API is unavailable
 * @param {Object} githubData - Structured GitHub data
 * @param {Object} notionContext - Optional Notion context
 * @returns {Object} - Basic summary
 */
function generateBasicSummary(githubData, notionContext = null) {
    const { contributors, changeSummary, rawData, repositoryOverview, bots } = githubData;

    // Generate repository purpose (from GitHub only)
    const repositoryPurpose = generateBasicPurpose(githubData);
    
    // Generate Notion summary as DISTINCT section (if available)
    let notionSummary = null;
    if (notionContext?.notion_summary) {
        // Create a proper summary from Notion content, not just an excerpt
        const notionContent = notionContext.notion_summary;
        // Extract first meaningful paragraph or section
        const lines = notionContent.split('\n').filter(line => line.trim().length > 0);
        const summaryLines = lines.slice(0, 5).join(' ');
        const maxLength = 500;
        notionSummary = summaryLines.length > maxLength 
            ? summaryLines.substring(0, maxLength) + '...'
            : summaryLines;
    }

    // Generate contributor summary (deduplicated, with proper bot handling)
    const seenLogins = new Set();
    const uniqueContributors = contributors.filter(c => {
        if (seenLogins.has(c.login)) return false;
        seenLogins.add(c.login);
        return true;
    });

    const humanCount = rawData.totalContributorsHuman;
    const botCount = rawData.totalBots;
    
    const topContributors = uniqueContributors.slice(0, 3);
    let contributorsSummary = `This repository has ${humanCount} human contributor${humanCount !== 1 ? 's' : ''}`;
    
    if (botCount > 0) {
        contributorsSummary += `. ${botCount} automated account${botCount !== 1 ? 's' : ''} (${bots.map(b => b.login).join(', ')}) ${botCount !== 1 ? 'were' : 'was'} excluded from this count`;
    }
    
    contributorsSummary += '. ';
    
    if (topContributors.length > 0) {
        contributorsSummary += `Top contributors include ${topContributors.map(c => 
            `@${c.login} (${c.contributions} contributions)`
        ).join(', ')}. `;
        
        // Identify focus areas
        const allAreas = new Set(uniqueContributors.flatMap(c => c.mainAreas || []));
        if (allAreas.size > 0) {
            contributorsSummary += `Development effort spans ${allAreas.size} different areas including ${Array.from(allAreas).slice(0, 3).join(', ')}.`;
        }
    }

    // Generate change summary
    const topFolders = changeSummary.mostChangedFolders?.slice(0, 3) || [];
    let changeSummaryText = '';
    
    if (topFolders.length > 0) {
        changeSummaryText = `Development activity is concentrated in ${topFolders.join(', ')}. `;
    }
    
    changeSummaryText += `The codebase has ${changeSummary.newFiles} new files, ${changeSummary.modifiedFiles} modified files, ` +
        `and ${changeSummary.deletedFiles} deleted files across ${changeSummary.totalCommits} commits.`;

    // Generate development narrative
    const commitCount = rawData.totalCommits;
    
    let developmentNarrative = `This ${repositoryOverview?.primaryLanguage || ''} project has been developed by ${humanCount} human contributor${humanCount !== 1 ? 's' : ''} `;
    developmentNarrative += `over ${commitCount} commits. `;
    
    if (topFolders.length > 0) {
        developmentNarrative += `The primary development focus has been on ${topFolders[0]}. `;
    }
    
    if (changeSummary.newFiles > changeSummary.modifiedFiles) {
        developmentNarrative += 'The high ratio of new files suggests active feature development or project scaffolding. ';
    } else {
        developmentNarrative += 'The codebase shows ongoing maintenance and refinement patterns. ';
    }
    
    if (humanCount > 3) {
        developmentNarrative += 'The project demonstrates collaborative development with multiple contributors.';
    } else {
        developmentNarrative += 'The project shows focused development with a small team.';
    }

    return {
        repositoryPurpose,
        notionSummary,
        contributorsSummary,
        changeSummary: changeSummaryText,
        developmentNarrative
    };
}

module.exports = {
    generateSummary
};
