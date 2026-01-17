/**
 * HackLens - Analyze Routes
 * Handles repository analysis API endpoints
 * 
 * ACCURACY RULES:
 * 1. Contributor count MUST match GitHub UI (uses Contributors API as source of truth)
 * 2. Contributors are deduplicated by author.login
 * 3. Bot accounts are detected and excluded from summaries
 * 4. No contributor name appears more than once
 */

const express = require('express');
const router = express.Router();
const githubService = require('../services/github');
const aiService = require('../services/ai');
const notionService = require('../services/notion');
const { parseRepoUrl } = require('../utils/parser');

/**
 * POST /api/analyze
 * Analyzes a GitHub repository and returns structured data with AI summary
 */
router.post('/analyze', async (req, res) => {
    try {
        const { repoUrl, githubToken, notion } = req.body;

        // Validate input
        if (!repoUrl) {
            return res.status(400).json({
                error: 'Missing required field',
                message: 'Repository URL is required'
            });
        }

        // Parse repository URL
        const repoInfo = parseRepoUrl(repoUrl);
        if (!repoInfo) {
            return res.status(400).json({
                error: 'Invalid repository URL',
                message: 'Please provide a valid GitHub repository URL (e.g., https://github.com/user/repo)'
            });
        }

        console.log(`[HackLens] Analyzing repository: ${repoInfo.owner}/${repoInfo.repo}`);

        // Use provided token or fall back to environment token
        const token = githubToken || process.env.GITHUB_TOKEN;

        // Fetch GitHub data (includes Contributors API as source of truth)
        const githubData = await githubService.analyzeRepository(
            repoInfo.owner,
            repoInfo.repo,
            token
        );

        // Fetch Notion content (optional - won't fail if not configured)
        let notionContext = { enabled: false, notion_summary: null };
        if (notion && notion.enabled) {
            console.log('[HackLens] Fetching Notion context...');
            notionContext = await notionService.ingestNotionContent(notion);
            if (notionContext.notion_summary) {
                console.log(`[HackLens] Notion context loaded: ${notionContext.blockCount} blocks from "${notionContext.pageTitle}"`);
            } else if (notionContext.error) {
                console.log(`[HackLens] Notion skipped: ${notionContext.error}`);
            }
        }

        // Validate data integrity
        const validation = githubData.validation;
        if (!validation.contributorCountMatchesAPI || !validation.noDuplicateLogins) {
            console.warn('[HackLens] Data validation warning:', validation);
        }

        // Generate AI summary (with optional Notion context)
        const aiSummary = await aiService.generateSummary(githubData, notionContext);

        // Construct final response with repository overview
        const response = {
            // Repository overview (what this project is about)
            repository: {
                name: repoInfo.repo,
                owner: repoInfo.owner,
                fullName: githubData.repositoryOverview.fullName,
                url: repoUrl,
                description: githubData.repositoryOverview.description,
                primaryLanguage: githubData.repositoryOverview.primaryLanguage,
                topics: githubData.repositoryOverview.topics,
                stars: githubData.repositoryOverview.stars,
                forks: githubData.repositoryOverview.forks,
                createdAt: githubData.repositoryOverview.createdAt,
                updatedAt: githubData.repositoryOverview.updatedAt
            },
            
            // Contributors (deduplicated, from Contributors API)
            contributors: githubData.contributors,
            
            // Bots detected (excluded from contributor summaries)
            bots: githubData.bots,
            
            // Counts (must match GitHub UI)
            counts: {
                totalContributors: githubData.rawData.totalContributors,
                humanContributors: githubData.rawData.totalContributorsHuman,
                botAccounts: githubData.rawData.totalBots,
                totalCommits: githubData.changeSummary.totalCommits
            },
            
            // Change summary
            changeSummary: githubData.changeSummary,
            
            // AI-generated summary
            aiSummary: aiSummary,
            
            // Notion context status (for frontend display)
            notionContext: {
                enabled: notionContext.enabled,
                hasContent: !!notionContext.notion_summary,
                pageTitle: notionContext.pageTitle || null,
                error: notionContext.error || null
            },
            
            // Validation status
            validation: {
                contributorCountMatchesAPI: validation.contributorCountMatchesAPI,
                noDuplicateContributors: validation.noDuplicateLogins,
                hasRepositoryPurpose: validation.hasRepositoryPurpose,
                isValid: validation.contributorCountMatchesAPI && 
                         validation.noDuplicateLogins && 
                         validation.hasRepositoryPurpose
            },
            
            analyzedAt: new Date().toISOString()
        };

        console.log(`[HackLens] Analysis complete for ${repoInfo.owner}/${repoInfo.repo}`);
        console.log(`[HackLens] Contributors: ${response.counts.totalContributors}, Bots: ${response.counts.botAccounts}`);
        res.json(response);

    } catch (error) {
        console.error('[HackLens] Analysis error:', error);

        // Handle specific error types
        if (error.status === 404) {
            return res.status(404).json({
                error: 'Repository not found',
                message: 'The repository does not exist or is private. Try providing a GitHub token.'
            });
        }

        if (error.status === 403) {
            return res.status(403).json({
                error: 'Rate limit exceeded',
                message: 'GitHub API rate limit exceeded. Please provide a GitHub token or try again later.'
            });
        }

        res.status(500).json({
            error: 'Analysis failed',
            message: error.message || 'An error occurred while analyzing the repository'
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'HackLens',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
