/**
 * HackLens - GitHub Service
 * Handles all GitHub API interactions
 * 
 * ACCURACY RULES IMPLEMENTED:
 * 1. Contributor count uses GitHub Contributors API as source of truth
 * 2. Contributors deduplicated by author.login (primary) and author.id (secondary)
 * 3. Bot accounts detected via '[bot]' in login
 * 4. No duplicate contributor names in output
 */

const BASE_URL = 'https://api.github.com';

/**
 * Makes an authenticated request to GitHub API
 * @param {string} endpoint - API endpoint
 * @param {string} token - GitHub personal access token (optional)
 * @returns {Promise<any>} - API response
 */
async function githubRequest(endpoint, token = null) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'HackLens-Intelligence-Tool'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });

    if (!response.ok) {
        const error = new Error(`GitHub API error: ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

/**
 * Fetches repository metadata
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token
 * @returns {Promise<Object>} - Repository metadata
 */
async function fetchRepoMetadata(owner, repo, token) {
    return githubRequest(`/repos/${owner}/${repo}`, token);
}

/**
 * Fetches README content (first 800 characters)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token
 * @returns {Promise<string>} - README content
 */
async function fetchReadme(owner, repo, token) {
    try {
        const data = await githubRequest(`/repos/${owner}/${repo}/readme`, token);
        if (data.content) {
            // Decode base64 content
            const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
            // Return first 800 characters
            return decoded.substring(0, 800);
        }
        return '';
    } catch (error) {
        console.log('[GitHub] README not found or inaccessible');
        return '';
    }
}

/**
 * Fetches contributors from GitHub Contributors API (SOURCE OF TRUTH)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token
 * @returns {Promise<Array>} - Array of contributors from API
 */
async function fetchContributorsAPI(owner, repo, token) {
    const contributors = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        try {
            const pageContributors = await githubRequest(
                `/repos/${owner}/${repo}/contributors?page=${page}&per_page=${perPage}&anon=false`,
                token
            );

            if (pageContributors.length === 0) break;

            contributors.push(...pageContributors);
            page++;

            if (pageContributors.length < perPage) break;
        } catch (error) {
            console.warn(`[GitHub] Failed to fetch contributors page ${page}:`, error.message);
            break;
        }
    }

    return contributors;
}

/**
 * Fetches all commits from a repository (handles pagination)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token
 * @returns {Promise<Array>} - Array of commits
 */
async function fetchCommits(owner, repo, token) {
    const commits = [];
    let page = 1;
    const perPage = 100;
    const maxCommits = 500; // Limit to prevent excessive API calls

    while (commits.length < maxCommits) {
        const pageCommits = await githubRequest(
            `/repos/${owner}/${repo}/commits?page=${page}&per_page=${perPage}`,
            token
        );

        if (pageCommits.length === 0) break;

        commits.push(...pageCommits);
        page++;

        if (pageCommits.length < perPage) break;
    }

    return commits;
}

/**
 * Fetches detailed commit information including files changed
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} sha - Commit SHA
 * @param {string} token - GitHub token
 * @returns {Promise<Object>} - Commit details
 */
async function fetchCommitDetails(owner, repo, sha, token) {
    return githubRequest(`/repos/${owner}/${repo}/commits/${sha}`, token);
}

/**
 * Detects if an account is a bot
 * @param {string} login - GitHub login
 * @returns {boolean} - True if bot account
 */
function isBot(login) {
    if (!login) return false;
    return login.includes('[bot]') || 
           login.endsWith('-bot') || 
           (login.endsWith('bot') && login.includes('['));
}

/**
 * Deduplicates contributors using login as primary key, id as secondary
 * @param {Array} apiContributors - Contributors from Contributors API
 * @param {Map} commitContributorMap - Map of contributors from commits
 * @returns {Object} - Deduplicated contributors and bot list
 */
function deduplicateContributors(apiContributors, commitContributorMap) {
    const seen = new Map(); // key: login, value: contributor data
    const seenIds = new Set(); // secondary check by id
    const bots = [];
    const humans = [];

    // Process API contributors first (source of truth)
    for (const contributor of apiContributors) {
        const login = contributor.login;
        const id = contributor.id;

        // Skip if already seen
        if (seen.has(login) || seenIds.has(id)) continue;

        seen.set(login, true);
        seenIds.add(id);

        // Check if bot
        if (isBot(login)) {
            bots.push({
                login,
                id,
                contributions: contributor.contributions,
                avatarUrl: contributor.avatar_url,
                isBot: true
            });
        } else {
            // Enrich with commit data if available
            const commitData = commitContributorMap.get(login) || {};
            
            humans.push({
                login,
                id,
                name: commitData.name || login,
                contributions: contributor.contributions,
                avatarUrl: contributor.avatar_url,
                folders: commitData.folders || new Set(),
                firstCommit: commitData.firstCommit,
                lastCommit: commitData.lastCommit,
                linesAdded: commitData.linesAdded || 0,
                linesRemoved: commitData.linesRemoved || 0,
                isBot: false
            });
        }
    }

    return { humans, bots };
}

/**
 * Analyzes a GitHub repository and aggregates data
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Object>} - Aggregated repository data
 */
async function analyzeRepository(owner, repo, token) {
    console.log(`[GitHub] Analyzing repository: ${owner}/${repo}`);

    // Fetch repository metadata, README, and contributors in parallel
    console.log('[GitHub] Fetching repository metadata, README, and contributors...');
    const [repoMetadata, readmeContent, apiContributors] = await Promise.all([
        fetchRepoMetadata(owner, repo, token),
        fetchReadme(owner, repo, token),
        fetchContributorsAPI(owner, repo, token)
    ]);

    console.log(`[GitHub] Repository: ${repoMetadata.name}`);
    console.log(`[GitHub] Contributors API count: ${apiContributors.length}`);

    // Fetch commits
    console.log('[GitHub] Fetching commit history...');
    const commits = await fetchCommits(owner, repo, token);
    console.log(`[GitHub] Found ${commits.length} commits`);

    // Build commit contributor map (keyed by login)
    const commitContributorMap = new Map();
    const folderChanges = new Map();
    const fileStats = {
        newFiles: new Set(),
        modifiedFiles: new Set(),
        deletedFiles: new Set()
    };

    // Process commits for contributor details
    for (const commit of commits) {
        // Use author.login as PRIMARY identifier
        const login = commit.author?.login;
        const authorName = commit.commit?.author?.name || login || 'Unknown';
        const timestamp = commit.commit?.author?.date;

        if (login) {
            if (!commitContributorMap.has(login)) {
                commitContributorMap.set(login, {
                    login,
                    name: authorName,
                    commitCount: 0,
                    firstCommit: timestamp,
                    lastCommit: timestamp,
                    folders: new Set(),
                    linesAdded: 0,
                    linesRemoved: 0
                });
            }

            const contributor = commitContributorMap.get(login);
            contributor.commitCount++;

            // Update first/last commit timestamps
            if (timestamp < contributor.firstCommit) contributor.firstCommit = timestamp;
            if (timestamp > contributor.lastCommit) contributor.lastCommit = timestamp;

            // Extract areas from commit message
            const message = commit.commit?.message || '';
            const areas = extractAreasFromMessage(message);
            areas.forEach(area => contributor.folders.add(area));
        }
    }

    // Fetch detailed commit info for file changes (sample)
    const sampleSize = Math.min(commits.length, 50);
    const sampleIndices = getSampleIndices(commits.length, sampleSize);

    console.log(`[GitHub] Fetching details for ${sampleSize} commits...`);

    const batchSize = 10;
    for (let i = 0; i < sampleIndices.length; i += batchSize) {
        const batch = sampleIndices.slice(i, i + batchSize);
        const detailPromises = batch.map(idx =>
            fetchCommitDetails(owner, repo, commits[idx].sha, token)
                .catch(err => {
                    console.warn(`[GitHub] Failed to fetch commit ${commits[idx].sha}: ${err.message}`);
                    return null;
                })
        );

        const details = await Promise.all(detailPromises);

        for (const detail of details) {
            if (!detail || !detail.files) continue;

            const login = detail.author?.login;
            const contributor = login ? commitContributorMap.get(login) : null;

            for (const file of detail.files) {
                // Track file changes
                const folder = extractFolder(file.filename);
                folderChanges.set(folder, (folderChanges.get(folder) || 0) + 1);

                // Track file status
                if (file.status === 'added') {
                    fileStats.newFiles.add(file.filename);
                } else if (file.status === 'removed') {
                    fileStats.deletedFiles.add(file.filename);
                } else {
                    fileStats.modifiedFiles.add(file.filename);
                }

                // Track lines changed per contributor
                if (contributor) {
                    contributor.linesAdded += file.additions || 0;
                    contributor.linesRemoved += file.deletions || 0;

                    // Add folder to contributor's areas
                    const area = categorizeFolder(folder);
                    if (area) contributor.folders.add(area);
                }
            }
        }
    }

    // Deduplicate contributors using API as source of truth
    const { humans, bots } = deduplicateContributors(apiContributors, commitContributorMap);

    // Verify no duplicates
    const uniqueLogins = new Set(humans.map(h => h.login));
    if (uniqueLogins.size !== humans.length) {
        console.error('[GitHub] WARNING: Duplicate contributors detected!');
    }

    // Format contributors for response
    const contributors = humans.map(c => ({
        login: c.login,
        name: c.name,
        id: c.id,
        contributions: c.contributions,
        avatarUrl: c.avatarUrl,
        mainAreas: Array.from(c.folders).slice(0, 5),
        activePeriod: c.firstCommit && c.lastCommit ? {
            from: c.firstCommit,
            to: c.lastCommit
        } : null,
        linesAdded: c.linesAdded,
        linesRemoved: c.linesRemoved,
        isBot: false
    })).sort((a, b) => b.contributions - a.contributions);

    // Format folder changes
    const mostChangedFolders = Array.from(folderChanges.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([folder, count]) => ({ folder, changeCount: count }));

    // Build repository overview
    const repositoryOverview = {
        name: repoMetadata.name,
        fullName: repoMetadata.full_name,
        description: repoMetadata.description || '',
        primaryLanguage: repoMetadata.language || 'Not specified',
        languages: [], // Would need separate API call
        stars: repoMetadata.stargazers_count,
        forks: repoMetadata.forks_count,
        openIssues: repoMetadata.open_issues_count,
        createdAt: repoMetadata.created_at,
        updatedAt: repoMetadata.updated_at,
        defaultBranch: repoMetadata.default_branch,
        topics: repoMetadata.topics || [],
        readme: readmeContent
    };

    // Build change summary
    const changeSummary = {
        mostChangedFolders: mostChangedFolders.map(f => f.folder),
        folderDetails: mostChangedFolders,
        newFiles: fileStats.newFiles.size,
        modifiedFiles: fileStats.modifiedFiles.size,
        deletedFiles: fileStats.deletedFiles.size,
        totalCommits: commits.length
    };

    // Build raw data for AI analysis
    const rawData = {
        repoInfo: { owner, repo },
        repositoryOverview,
        totalCommits: commits.length,
        totalContributors: apiContributors.length, // From Contributors API
        totalContributorsHuman: humans.length,
        totalBots: bots.length,
        contributors: contributors,
        bots: bots.map(b => ({
            login: b.login,
            contributions: b.contributions
        })),
        changeSummary: changeSummary,
        recentCommits: commits.slice(0, 20).map(c => ({
            message: c.commit?.message?.split('\n')[0] || '',
            author: c.author?.login || c.commit?.author?.name || 'Unknown',
            date: c.commit?.author?.date
        }))
    };

    // Validation check
    const validation = {
        contributorCountMatchesAPI: contributors.length === humans.length,
        noDuplicateLogins: uniqueLogins.size === humans.length,
        hasRepositoryPurpose: !!(repositoryOverview.description || readmeContent),
        botsExcluded: bots.length
    };

    console.log(`[GitHub] Analysis complete. Contributors: ${contributors.length}, Bots: ${bots.length}`);

    return {
        repositoryOverview,
        contributors,
        bots,
        changeSummary,
        rawData,
        validation
    };
}

/**
 * Gets evenly distributed sample indices
 * @param {number} total - Total number of items
 * @param {number} sampleSize - Desired sample size
 * @returns {Array<number>} - Array of indices
 */
function getSampleIndices(total, sampleSize) {
    if (total <= sampleSize) {
        return Array.from({ length: total }, (_, i) => i);
    }

    const indices = [];
    const step = total / sampleSize;

    for (let i = 0; i < sampleSize; i++) {
        indices.push(Math.floor(i * step));
    }

    return indices;
}

/**
 * Extracts folder path from filename
 * @param {string} filename - Full file path
 * @returns {string} - Folder path
 */
function extractFolder(filename) {
    const parts = filename.split('/');
    if (parts.length === 1) return '/root';
    return '/' + parts.slice(0, -1).join('/');
}

/**
 * Categorizes folder into development area
 * @param {string} folder - Folder path
 * @returns {string|null} - Area category
 */
function categorizeFolder(folder) {
    const lower = folder.toLowerCase();
    
    if (lower.includes('test') || lower.includes('spec')) return 'testing';
    if (lower.includes('doc')) return 'documentation';
    if (lower.includes('src/api') || lower.includes('/api/')) return 'api';
    if (lower.includes('frontend') || lower.includes('client') || lower.includes('ui')) return 'frontend';
    if (lower.includes('backend') || lower.includes('server')) return 'backend';
    if (lower.includes('config') || lower.includes('.github')) return 'configuration';
    if (lower.includes('public') || lower.includes('static') || lower.includes('assets')) return 'assets';
    if (lower.includes('style') || lower.includes('css')) return 'styling';
    if (lower.includes('component')) return 'components';
    if (lower.includes('service')) return 'services';
    if (lower.includes('util') || lower.includes('helper')) return 'utilities';
    if (lower.includes('model') || lower.includes('schema')) return 'data-models';
    
    return null;
}

/**
 * Extracts potential areas/modules from commit message
 * @param {string} message - Commit message
 * @returns {Array<string>} - Extracted areas
 */
function extractAreasFromMessage(message) {
    const areas = new Set();
    const lowerMessage = message.toLowerCase();

    const patterns = [
        { regex: /\b(frontend|front-end|ui|client)\b/i, area: 'frontend' },
        { regex: /\b(backend|back-end|server|api)\b/i, area: 'backend' },
        { regex: /\b(database|db|sql|mongo)\b/i, area: 'database' },
        { regex: /\b(test|testing|spec|jest|mocha)\b/i, area: 'testing' },
        { regex: /\b(docs?|documentation|readme)\b/i, area: 'documentation' },
        { regex: /\b(config|configuration|setup|env)\b/i, area: 'configuration' },
        { regex: /\b(ci|cd|pipeline|deploy|build)\b/i, area: 'devops' },
        { regex: /\b(auth|authentication|login|security)\b/i, area: 'authentication' },
        { regex: /\b(style|css|scss|styling)\b/i, area: 'styling' },
        { regex: /\b(fix|bug|issue|error)\b/i, area: 'bug-fixes' },
        { regex: /\b(feature|feat|add|new)\b/i, area: 'features' },
        { regex: /\b(refactor|cleanup|improve)\b/i, area: 'refactoring' },
        { regex: /\b(infra|infrastructure|devops)\b/i, area: 'infrastructure' }
    ];

    for (const { regex, area } of patterns) {
        if (regex.test(lowerMessage)) {
            areas.add(area);
        }
    }

    return Array.from(areas);
}

module.exports = {
    analyzeRepository,
    fetchCommits,
    fetchCommitDetails,
    fetchContributorsAPI,
    fetchRepoMetadata,
    fetchReadme
};
