/**
 * HackLens - Frontend Application
 * Handles UI interactions and API communication
 * 
 * ACCURACY RULES DISPLAYED:
 * - Contributor count matches GitHub UI
 * - Contributors deduplicated by login
 * - Bot accounts shown separately
 * - Repository purpose clearly explained
 */

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Sections
    landingSection: document.getElementById('landing-section'),
    loadingSection: document.getElementById('loading-section'),
    resultsSection: document.getElementById('results-section'),

    // Form elements
    analyzeForm: document.getElementById('analyze-form'),
    repoUrlInput: document.getElementById('repo-url'),
    analyzeBtn: document.getElementById('analyze-btn'),
    backBtn: document.getElementById('back-btn'),

    // Loading elements
    loadingStatus: document.getElementById('loading-status'),
    progressBar: document.getElementById('progress-bar'),

    // Error elements
    errorContainer: document.getElementById('error-container'),
    errorText: document.getElementById('error-text'),

    // Results - Repository info
    repoName: document.getElementById('repo-name'),
    repoLink: document.getElementById('repo-link'),
    analysisTime: document.getElementById('analysis-time'),

    // Results - Repository overview (NEW)
    repoPurpose: document.getElementById('repo-purpose'),
    repoLanguage: document.getElementById('repo-language'),
    repoStars: document.getElementById('repo-stars'),
    repoForks: document.getElementById('repo-forks'),
    repoContributorsCount: document.getElementById('repo-contributors-count'),
    repoTopics: document.getElementById('repo-topics'),
    validationBadge: document.getElementById('validation-badge'),

    // Results - AI Summary
    developmentNarrative: document.getElementById('development-narrative'),
    contributorsSummary: document.getElementById('contributors-summary'),
    changeSummary: document.getElementById('change-summary'),

    // Results - Contributor counts (NEW)
    humanContributors: document.getElementById('human-contributors'),
    botCount: document.getElementById('bot-count'),

    // Results - Stats
    totalCommits: document.getElementById('total-commits'),
    newFiles: document.getElementById('new-files'),
    modifiedFiles: document.getElementById('modified-files'),
    deletedFiles: document.getElementById('deleted-files'),

    // Results - Lists
    contributorsList: document.getElementById('contributors-list'),
    foldersList: document.getElementById('folders-list')
};

// ============================================
// State
// ============================================
let isAnalyzing = false;

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkUrlParams();
});

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Form submission
    elements.analyzeForm.addEventListener('submit', handleAnalyzeSubmit);

    // Back button
    elements.backBtn.addEventListener('click', handleBackClick);

    // Input validation
    elements.repoUrlInput.addEventListener('input', handleRepoUrlInput);
}

/**
 * Check URL parameters for pre-filled repo
 */
function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const repo = params.get('repo');
    if (repo) {
        elements.repoUrlInput.value = repo;
    }
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handle analyze form submission
 * @param {Event} event - Form submit event
 */
async function handleAnalyzeSubmit(event) {
    event.preventDefault();

    if (isAnalyzing) return;

    const repoUrl = elements.repoUrlInput.value.trim();

    // Validate URL
    if (!isValidGitHubUrl(repoUrl)) {
        showError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
        return;
    }

    // Start analysis (token is handled server-side via .env)
    await analyzeRepository(repoUrl);
}

/**
 * Handle back button click
 */
function handleBackClick() {
    showSection('landing');
    hideError();
}

/**
 * Handle repo URL input changes
 */
function handleRepoUrlInput() {
    hideError();
}

// ============================================
// API Communication
// ============================================

/**
 * Send repository for analysis
 * @param {string} repoUrl - GitHub repository URL
 */
async function analyzeRepository(repoUrl) {
    isAnalyzing = true;
    showSection('loading');
    hideError();
    setButtonLoading(true);

    // Update loading status messages
    const statusMessages = [
        'Connecting to GitHub...',
        'Fetching commit history...',
        'Analyzing contributors...',
        'Processing file changes...',
        'Generating AI summary...',
        'Finalizing report...'
    ];

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
        if (statusIndex < statusMessages.length - 1) {
            statusIndex++;
            elements.loadingStatus.textContent = statusMessages[statusIndex];
        }
    }, 1500);

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                repoUrl: repoUrl
            })
        });

        clearInterval(statusInterval);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Analysis failed');
        }

        const data = await response.json();
        displayResults(data);
        showSection('results');

    } catch (error) {
        clearInterval(statusInterval);
        console.error('Analysis error:', error);
        showError(error.message || 'An error occurred while analyzing the repository');
        showSection('landing');
    } finally {
        isAnalyzing = false;
        setButtonLoading(false);
    }
}

// ============================================
// UI Updates
// ============================================

/**
 * Show a specific section and hide others
 * @param {string} sectionName - 'landing', 'loading', or 'results'
 */
function showSection(sectionName) {
    elements.landingSection.classList.add('hidden');
    elements.loadingSection.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');

    switch (sectionName) {
        case 'landing':
            elements.landingSection.classList.remove('hidden');
            break;
        case 'loading':
            elements.loadingSection.classList.remove('hidden');
            elements.loadingStatus.textContent = 'Connecting to GitHub...';
            break;
        case 'results':
            elements.resultsSection.classList.remove('hidden');
            break;
    }
}

/**
 * Display analysis results
 * @param {Object} data - Analysis response data
 */
function displayResults(data) {
    // Repository info
    const repoFullName = `${data.repository.owner}/${data.repository.name}`;
    elements.repoName.textContent = repoFullName;
    elements.repoLink.href = data.repository.url;
    elements.analysisTime.textContent = `Analyzed ${formatRelativeTime(data.analyzedAt)}`;

    // Repository Overview (NEW)
    displayRepositoryOverview(data);

    // Validation badge
    displayValidationStatus(data.validation);

    // AI Summary
    elements.developmentNarrative.textContent = data.aiSummary?.developmentNarrative || 'No narrative available.';
    elements.contributorsSummary.textContent = data.aiSummary?.contributorsSummary || 'No contributor summary available.';
    elements.changeSummary.textContent = data.aiSummary?.changeSummary || 'No change summary available.';

    // Contributor counts (from Contributors API - source of truth)
    if (elements.humanContributors) {
        const humanCount = data.counts?.humanContributors || data.contributors?.length || 0;
        elements.humanContributors.textContent = `${humanCount} contributor${humanCount !== 1 ? 's' : ''}`;
    }
    
    if (elements.botCount && data.counts?.botAccounts > 0) {
        elements.botCount.textContent = `${data.counts.botAccounts} bot${data.counts.botAccounts !== 1 ? 's' : ''} excluded`;
        elements.botCount.classList.remove('hidden');
    } else if (elements.botCount) {
        elements.botCount.classList.add('hidden');
    }

    // Stats
    elements.totalCommits.textContent = formatNumber(data.changeSummary?.totalCommits || 0);
    elements.newFiles.textContent = formatNumber(data.changeSummary?.newFiles || 0);
    elements.modifiedFiles.textContent = formatNumber(data.changeSummary?.modifiedFiles || 0);
    elements.deletedFiles.textContent = formatNumber(data.changeSummary?.deletedFiles || 0);

    // Contributors list (deduplicated)
    renderContributorsList(data.contributors || []);

    // Folders list
    renderFoldersList(data.changeSummary?.folderDetails || []);
}

/**
 * Display repository overview section
 * @param {Object} data - Analysis response data
 */
function displayRepositoryOverview(data) {
    // Repository purpose from AI
    if (elements.repoPurpose) {
        elements.repoPurpose.textContent = data.aiSummary?.repositoryPurpose || 
            data.repository?.description || 
            'Repository purpose could not be determined.';
    }

    // Language
    if (elements.repoLanguage) {
        const langValue = elements.repoLanguage.querySelector('.meta-value');
        if (langValue) {
            langValue.textContent = data.repository?.primaryLanguage || 'Unknown';
        }
    }

    // Stars
    if (elements.repoStars) {
        const starsValue = elements.repoStars.querySelector('.meta-value');
        if (starsValue) {
            starsValue.textContent = formatNumber(data.repository?.stars || 0);
        }
    }

    // Forks
    if (elements.repoForks) {
        const forksValue = elements.repoForks.querySelector('.meta-value');
        if (forksValue) {
            forksValue.textContent = formatNumber(data.repository?.forks || 0);
        }
    }

    // Contributor count (from Contributors API)
    if (elements.repoContributorsCount) {
        const contribValue = elements.repoContributorsCount.querySelector('.meta-value');
        if (contribValue) {
            contribValue.textContent = data.counts?.totalContributors || data.contributors?.length || 0;
        }
    }

    // Topics
    if (elements.repoTopics) {
        const topics = data.repository?.topics || [];
        if (topics.length > 0) {
            elements.repoTopics.innerHTML = topics.slice(0, 8).map(topic => 
                `<span class="topic-tag">${escapeHtml(topic)}</span>`
            ).join('');
        } else {
            elements.repoTopics.innerHTML = '';
        }
    }
}

/**
 * Display validation status badge
 * @param {Object} validation - Validation data
 */
function displayValidationStatus(validation) {
    if (!elements.validationBadge) return;

    if (validation && !validation.isValid) {
        elements.validationBadge.classList.remove('hidden');
        const validationText = elements.validationBadge.querySelector('.validation-text');
        if (validationText) {
            const issues = [];
            if (!validation.contributorCountMatchesAPI) issues.push('contributor count mismatch');
            if (!validation.noDuplicateContributors) issues.push('duplicate contributors');
            if (!validation.hasRepositoryPurpose) issues.push('missing repository purpose');
            validationText.textContent = `Data warning: ${issues.join(', ')}`;
        }
    } else {
        elements.validationBadge.classList.add('hidden');
    }
}

/**
 * Render contributors list (deduplicated by login)
 * @param {Array} contributors - Array of contributor objects
 */
function renderContributorsList(contributors) {
    if (contributors.length === 0) {
        elements.contributorsList.innerHTML = '<p class="no-data">No contributor data available</p>';
        return;
    }

    // Deduplicate by login (should already be deduplicated, but double-check)
    const seenLogins = new Set();
    const uniqueContributors = contributors.filter(c => {
        const login = c.login || c.name;
        if (seenLogins.has(login)) return false;
        seenLogins.add(login);
        return true;
    });

    const html = uniqueContributors.map(contributor => {
        const login = contributor.login || contributor.name;
        const displayName = contributor.name || contributor.login || 'Unknown';
        const avatarUrl = contributor.avatarUrl;
        const areas = contributor.mainAreas?.length > 0 
            ? contributor.mainAreas.slice(0, 3).join(', ') 
            : 'various areas';
        const contributions = contributor.contributions || contributor.commitCount || 0;
        
        // Use avatar if available, otherwise initials
        const avatarHtml = avatarUrl 
            ? `<img src="${avatarUrl}" alt="${escapeHtml(displayName)}" class="contributor-avatar-img" loading="lazy">`
            : `<div class="contributor-avatar">${getInitials(displayName)}</div>`;
        
        return `
            <div class="contributor-item">
                ${avatarHtml}
                <div class="contributor-info">
                    <div class="contributor-name">${escapeHtml(displayName)}</div>
                    <div class="contributor-login">@${escapeHtml(login)}</div>
                    <div class="contributor-areas">${escapeHtml(areas)}</div>
                </div>
                <div class="contributor-commits">${contributions} contributions</div>
            </div>
        `;
    }).join('');

    elements.contributorsList.innerHTML = html;
}

/**
 * Render folders list
 * @param {Array} folders - Array of folder objects
 */
function renderFoldersList(folders) {
    if (folders.length === 0) {
        elements.foldersList.innerHTML = '<p class="no-data">No folder data available</p>';
        return;
    }

    const html = folders.slice(0, 10).map(folder => `
        <div class="folder-item">
            <span class="folder-path">${escapeHtml(folder.folder)}</span>
            <span class="folder-count">${folder.changeCount} changes</span>
        </div>
    `).join('');

    elements.foldersList.innerHTML = html;
}

/**
 * Set button loading state
 * @param {boolean} loading - Whether button should show loading state
 */
function setButtonLoading(loading) {
    const btnText = elements.analyzeBtn.querySelector('.btn-text');
    const btnLoader = elements.analyzeBtn.querySelector('.btn-loader');

    if (loading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        elements.analyzeBtn.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        elements.analyzeBtn.disabled = false;
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorContainer.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    elements.errorContainer.classList.add('hidden');
}

// ============================================
// Utility Functions
// ============================================

/**
 * Validate GitHub URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function isValidGitHubUrl(url) {
    if (!url) return false;
    
    // Match various GitHub URL formats
    const patterns = [
        /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/,
        /^github\.com\/[\w.-]+\/[\w.-]+\/?$/,
        /^[\w.-]+\/[\w.-]+$/
    ];

    return patterns.some(pattern => pattern.test(url.trim()));
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
function getInitials(name) {
    if (!name) return '?';
    
    const parts = name.trim().split(/[\s._-]+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Format relative time
 * @param {string} isoDate - ISO date string
 * @returns {string} - Relative time string
 */
function formatRelativeTime(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
        return 'just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
