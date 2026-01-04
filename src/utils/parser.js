/**
 * HackLens - URL Parser Utility
 * Handles parsing and validation of GitHub repository URLs
 */

/**
 * Parses a GitHub repository URL and extracts owner and repo name
 * Supports various GitHub URL formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - owner/repo
 * 
 * @param {string} url - GitHub repository URL or shorthand
 * @returns {Object|null} - { owner, repo } or null if invalid
 */
function parseRepoUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Trim whitespace
    url = url.trim();

    // Remove trailing slashes
    url = url.replace(/\/+$/, '');

    // Remove .git suffix
    url = url.replace(/\.git$/, '');

    // Try to match full GitHub URL
    const fullUrlRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
    const fullMatch = url.match(fullUrlRegex);

    if (fullMatch) {
        return {
            owner: fullMatch[1],
            repo: fullMatch[2]
        };
    }

    // Try to match shorthand format (owner/repo)
    const shorthandRegex = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/;
    const shortMatch = url.match(shorthandRegex);

    if (shortMatch) {
        return {
            owner: shortMatch[1],
            repo: shortMatch[2]
        };
    }

    return null;
}

/**
 * Validates if a string is a valid GitHub repository URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function isValidRepoUrl(url) {
    return parseRepoUrl(url) !== null;
}

/**
 * Constructs a full GitHub URL from owner and repo
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {string} - Full GitHub URL
 */
function buildRepoUrl(owner, repo) {
    return `https://github.com/${owner}/${repo}`;
}

module.exports = {
    parseRepoUrl,
    isValidRepoUrl,
    buildRepoUrl
};
