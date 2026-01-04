/**
 * HackLens - AI Service
 * Handles OpenRouter API integration for generating summaries
 * 
 * STRICT OUTPUT RULES:
 * - DO NOT score contributors
 * - DO NOT rank contributors
 * - DO NOT judge code quality
 * - DO NOT guess missing data
 * - DO NOT repeat names
 * - DO NOT output raw GitHub stats without explanation
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * System prompt for the AI model - implements strict accuracy rules
 */
const SYSTEM_PROMPT = `You are HackLens, a GitHub development intelligence system.

Your job is to analyze GitHub repository data and generate an accurate, human-readable development summary for a team lead or authority.

THIS IS NOT A SCORING OR JUDGING SYSTEM.
Your role is to explain what happened during development.

========================
STRICT OUTPUT RULES
========================

- DO NOT score contributors
- DO NOT rank contributors  
- DO NOT judge code quality
- DO NOT guess missing data
- DO NOT repeat names
- DO NOT output raw GitHub stats without explanation

========================
ANALYSIS REQUIREMENTS
========================

A. Repository Purpose
- Clearly explain what the repository is about
- Use README + description + dominant folders
- Do NOT describe only file paths without context

B. Contributor Intelligence (WHO)
- Total contributors (must match provided count)
- High-level contributor roles (e.g., backend-focused, infra, frontend)
- Contribution patterns (sustained vs burst activity)

C. Change Mapping (WHERE)
- Most changed folders and files
- New vs modified files
- Dominant areas of development

D. Development Narrative (WHAT HAPPENED)
- How the project evolved over time
- Early scaffolding vs later refinement
- Collaboration patterns
- Maintenance vs feature expansion signals

========================
OUTPUT FORMAT
========================

Return a valid JSON object with exactly these four fields:
- repository_purpose: A clear 2-3 sentence explanation of what this project is about
- contributors_summary: Who contributed and what areas they worked on (2-4 sentences, no duplicates)
- change_summary: Where changes occurred in the codebase (2-4 sentences)
- development_narrative: How the project evolved over time (3-5 sentences)

Be factual, objective, and concise. Output must be readable in under 2 minutes.`;

/**
 * Builds the analysis prompt with repository data
 * @param {Object} data - Structured GitHub data
 * @returns {string} - Formatted prompt
 */
function buildAnalysisPrompt(data) {
    const { rawData, repositoryOverview, contributors, changeSummary, bots } = data;
    
    // Build repository context
    const repoContext = `
Repository: ${rawData.repoInfo.owner}/${rawData.repoInfo.repo}
Description: ${repositoryOverview?.description || 'No description provided'}
Primary Language: ${repositoryOverview?.primaryLanguage || 'Not specified'}
Topics: ${repositoryOverview?.topics?.join(', ') || 'None'}
Stars: ${repositoryOverview?.stars || 0}
Created: ${repositoryOverview?.createdAt || 'Unknown'}

README (first 500 chars):
${repositoryOverview?.readme?.substring(0, 500) || 'No README available'}
`;

    // Build contributor context (deduplicated by login)
    const seenLogins = new Set();
    const uniqueContributors = contributors.filter(c => {
        if (seenLogins.has(c.login)) return false;
        seenLogins.add(c.login);
        return true;
    });

    const contributorContext = `
Total Contributors (from GitHub API): ${rawData.totalContributors}
Human Contributors: ${rawData.totalContributorsHuman}
Bot Accounts Detected: ${rawData.totalBots}
${bots?.length > 0 ? `Bots: ${bots.map(b => b.login).join(', ')}` : ''}

Contributors (deduplicated by login):
${uniqueContributors.slice(0, 15).map(c => 
    `- @${c.login} (${c.name}): ${c.contributions} contributions, areas: [${c.mainAreas?.join(', ') || 'various'}]`
).join('\n')}
${uniqueContributors.length > 15 ? `\n... and ${uniqueContributors.length - 15} more contributors` : ''}
`;

    // Build change context
    const changeContext = `
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
Recent Commit Messages (sample):
${rawData.recentCommits?.slice(0, 10).map(c => 
    `- "${c.message}" by @${c.author}`
).join('\n') || 'N/A'}
`;

    return `Analyze this GitHub repository data and generate a development summary.

${repoContext}
${contributorContext}
${changeContext}
${commitsContext}

IMPORTANT:
- Contributor count MUST be ${rawData.totalContributors} (from GitHub API)
- Do NOT duplicate any contributor names
- Explain the repository purpose clearly
- Focus on development progression, not judgments

Generate a JSON response with repository_purpose, contributors_summary, change_summary, and development_narrative fields.`;
}

/**
 * Generates AI summary using OpenRouter API
 * @param {Object} githubData - Structured GitHub data
 * @returns {Promise<Object>} - AI-generated summary
 */
async function generateSummary(githubData) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // If no API key, return a basic summary
    if (!apiKey) {
        console.log('[AI] No OpenRouter API key found, generating basic summary');
        return generateBasicSummary(githubData);
    }

    try {
        console.log('[AI] Generating summary with OpenRouter...');

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
                    { role: 'user', content: buildAnalysisPrompt(githubData) }
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
        return {
            repositoryPurpose: aiResponse.repository_purpose || generateBasicPurpose(githubData),
            contributorsSummary: aiResponse.contributors_summary || 'Unable to generate contributor summary.',
            changeSummary: aiResponse.change_summary || 'Unable to generate change summary.',
            developmentNarrative: aiResponse.development_narrative || 'Unable to generate development narrative.'
        };

    } catch (error) {
        console.error('[AI] Error generating summary:', error);
        // Fall back to basic summary
        return generateBasicSummary(githubData);
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
 * @returns {Object} - Basic summary
 */
function generateBasicSummary(githubData) {
    const { contributors, changeSummary, rawData, repositoryOverview, bots } = githubData;

    // Generate repository purpose
    const repositoryPurpose = generateBasicPurpose(githubData);

    // Generate contributor summary (deduplicated)
    const seenLogins = new Set();
    const uniqueContributors = contributors.filter(c => {
        if (seenLogins.has(c.login)) return false;
        seenLogins.add(c.login);
        return true;
    });

    const topContributors = uniqueContributors.slice(0, 3);
    let contributorsSummary = `This repository has ${rawData.totalContributors} contributor(s)`;
    
    if (bots?.length > 0) {
        contributorsSummary += ` (${bots.length} bot account(s) excluded from this summary)`;
    }
    
    contributorsSummary += '. ';
    
    if (topContributors.length > 0) {
        contributorsSummary += `Notable contributors include ${topContributors.map(c => 
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
    const developerCount = uniqueContributors.length;
    const commitCount = rawData.totalCommits;
    
    let developmentNarrative = `This ${repositoryOverview?.primaryLanguage || ''} project has been developed by ${developerCount} contributor(s) `;
    developmentNarrative += `over ${commitCount} commits. `;
    
    if (topFolders.length > 0) {
        developmentNarrative += `The primary development focus has been on ${topFolders[0]}. `;
    }
    
    if (changeSummary.newFiles > changeSummary.modifiedFiles) {
        developmentNarrative += 'The high ratio of new files suggests active feature development or project scaffolding. ';
    } else {
        developmentNarrative += 'The codebase shows ongoing maintenance and refinement patterns. ';
    }
    
    if (developerCount > 3) {
        developmentNarrative += 'The project demonstrates collaborative development with multiple contributors.';
    } else {
        developmentNarrative += 'The project shows focused development with a small team.';
    }

    return {
        repositoryPurpose,
        contributorsSummary,
        changeSummary: changeSummaryText,
        developmentNarrative
    };
}

module.exports = {
    generateSummary
};
