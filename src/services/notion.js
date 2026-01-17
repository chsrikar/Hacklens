/**
 * HackLens - Notion Service
 * Handles Notion API integration for fetching page content
 * 
 * USAGE RULES:
 * - Notion is OPTIONAL context enrichment
 * - GitHub remains the source of truth for activity
 * - Notion content should NOT override GitHub facts
 * - Never log raw Notion content for security
 */

const NOTION_API_URL = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2022-06-28';

/**
 * Makes an authenticated request to Notion API
 * @param {string} endpoint - API endpoint
 * @param {string} token - Notion integration token
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} - API response
 */
async function notionRequest(endpoint, token, options = {}) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch(`${NOTION_API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = new Error(`Notion API error: ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

/**
 * Extracts page ID from various Notion URL formats or returns as-is if already an ID
 * @param {string} pageIdOrUrl - Notion page ID or URL
 * @returns {string} - Clean page ID (32 chars, no dashes)
 */
function extractPageId(pageIdOrUrl) {
    if (!pageIdOrUrl) return null;

    // If it's already a clean ID (32 hex chars)
    const cleanIdPattern = /^[a-f0-9]{32}$/i;
    if (cleanIdPattern.test(pageIdOrUrl)) {
        return pageIdOrUrl;
    }

    // If it's a UUID format (with dashes)
    const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (uuidPattern.test(pageIdOrUrl)) {
        return pageIdOrUrl.replace(/-/g, '');
    }

    // Extract from Notion URL formats:
    // https://www.notion.so/workspace/Page-Title-abc123def456...
    // https://www.notion.so/abc123def456...
    // https://notion.so/Page-Title-abc123def456...
    const urlPattern = /(?:notion\.so\/(?:[^/]+\/)?(?:[^-]+-)?)?([a-f0-9]{32})(?:\?.*)?$/i;
    const match = pageIdOrUrl.match(urlPattern);
    
    if (match && match[1]) {
        return match[1];
    }

    // Try to find any 32-char hex string in the input
    const hexMatch = pageIdOrUrl.match(/[a-f0-9]{32}/i);
    if (hexMatch) {
        return hexMatch[0];
    }

    // Return as-is if no pattern matches (will likely fail at API call)
    return pageIdOrUrl;
}

/**
 * Fetches a Notion page and its properties
 * @param {string} pageId - Notion page ID
 * @param {string} token - Notion integration token
 * @returns {Promise<Object>} - Page data
 */
async function fetchPage(pageId, token) {
    const cleanId = extractPageId(pageId);
    return notionRequest(`/pages/${cleanId}`, token);
}

/**
 * Fetches all blocks (content) from a Notion page
 * @param {string} pageId - Notion page ID
 * @param {string} token - Notion integration token
 * @returns {Promise<Array>} - Array of blocks
 */
async function fetchPageBlocks(pageId, token) {
    const cleanId = extractPageId(pageId);
    const blocks = [];
    let cursor = undefined;
    let iteration = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (iteration < maxIterations) {
        const endpoint = cursor 
            ? `/blocks/${cleanId}/children?start_cursor=${cursor}&page_size=100`
            : `/blocks/${cleanId}/children?page_size=100`;
        
        const response = await notionRequest(endpoint, token);
        
        blocks.push(...response.results);
        
        if (!response.has_more) break;
        cursor = response.next_cursor;
        iteration++;
    }

    return blocks;
}

/**
 * Extracts plain text from Notion rich text array
 * @param {Array} richText - Notion rich text array
 * @returns {string} - Plain text
 */
function extractPlainText(richText) {
    if (!Array.isArray(richText)) return '';
    return richText.map(rt => rt.plain_text || '').join('');
}

/**
 * Extracts text content from a single block
 * @param {Object} block - Notion block object
 * @returns {string|null} - Extracted text or null if not applicable
 */
function extractBlockText(block) {
    const type = block.type;
    
    // Types we want to extract (headings, paragraphs, bullet points)
    const supportedTypes = [
        'paragraph',
        'heading_1',
        'heading_2',
        'heading_3',
        'bulleted_list_item',
        'numbered_list_item',
        'toggle',
        'quote',
        'callout'
    ];

    // Types we explicitly ignore
    const ignoredTypes = [
        'table',
        'table_row',
        'column_list',
        'column',
        'embed',
        'bookmark',
        'image',
        'video',
        'file',
        'pdf',
        'audio',
        'code', // Code blocks are implementation details
        'equation',
        'divider',
        'table_of_contents',
        'breadcrumb',
        'link_preview',
        'synced_block',
        'template',
        'link_to_page',
        'child_page',
        'child_database',
        'unsupported'
    ];

    if (ignoredTypes.includes(type)) {
        return null;
    }

    if (!supportedTypes.includes(type)) {
        return null;
    }

    const blockContent = block[type];
    if (!blockContent || !blockContent.rich_text) {
        return null;
    }

    const text = extractPlainText(blockContent.rich_text);
    
    // Skip empty text
    if (!text.trim()) {
        return null;
    }

    // Add formatting based on block type
    switch (type) {
        case 'heading_1':
            return `# ${text}`;
        case 'heading_2':
            return `## ${text}`;
        case 'heading_3':
            return `### ${text}`;
        case 'bulleted_list_item':
            return `• ${text}`;
        case 'numbered_list_item':
            return `- ${text}`;
        case 'quote':
            return `> ${text}`;
        case 'callout':
            return `[!] ${text}`;
        default:
            return text;
    }
}

/**
 * Extracts page title from page properties
 * @param {Object} page - Notion page object
 * @returns {string} - Page title
 */
function extractPageTitle(page) {
    if (!page || !page.properties) return 'Untitled';
    
    // Try common title property names
    const titleProps = ['title', 'Title', 'Name', 'name'];
    
    for (const propName of titleProps) {
        const prop = page.properties[propName];
        if (prop && prop.title) {
            return extractPlainText(prop.title);
        }
    }
    
    // Try to find any title-type property
    for (const [key, value] of Object.entries(page.properties)) {
        if (value.type === 'title' && value.title) {
            return extractPlainText(value.title);
        }
    }
    
    return 'Untitled';
}

/**
 * Fetches and processes Notion page content
 * Returns clean, text-only representation suitable for AI context
 * @param {string} pageId - Notion page ID or URL
 * @param {string} token - Notion integration token
 * @returns {Promise<Object>} - Processed Notion content
 */
async function fetchPageContent(pageId, token) {
    try {
        console.log('[Notion] Fetching page content...');
        
        // Fetch page metadata and blocks in parallel
        const [page, blocks] = await Promise.all([
            fetchPage(pageId, token),
            fetchPageBlocks(pageId, token)
        ]);

        // Extract page title
        const title = extractPageTitle(page);

        // Extract text from blocks
        const textParts = [];
        
        for (const block of blocks) {
            const text = extractBlockText(block);
            if (text) {
                textParts.push(text);
            }
        }

        // Combine into clean summary
        const summary = textParts.join('\n');
        
        // Truncate if too long (max 3000 chars to keep AI context reasonable)
        const maxLength = 3000;
        const truncatedSummary = summary.length > maxLength 
            ? summary.substring(0, maxLength) + '...[truncated]'
            : summary;

        console.log(`[Notion] Extracted ${textParts.length} text blocks from page "${title}"`);

        return {
            success: true,
            pageTitle: title,
            contentSummary: truncatedSummary,
            blockCount: textParts.length,
            lastEditedTime: page.last_edited_time
        };

    } catch (error) {
        console.error('[Notion] Error fetching page content:', error.message);
        
        // Return graceful failure - Notion is optional
        return {
            success: false,
            error: error.message,
            pageTitle: null,
            contentSummary: null
        };
    }
}

/**
 * Validates Notion integration token by attempting to fetch user info
 * @param {string} token - Notion integration token
 * @returns {Promise<boolean>} - True if token is valid
 */
async function validateToken(token) {
    try {
        await notionRequest('/users/me', token);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Main entry point for Notion content ingestion
 * Handles all error cases gracefully since Notion is optional
 * @param {Object} notionConfig - Notion configuration from request
 * @param {string} backendToken - Token from environment (optional override)
 * @returns {Promise<Object>} - Notion context for AI
 */
async function ingestNotionContent(notionConfig, backendToken = null) {
    // Check if Notion is enabled
    if (!notionConfig || !notionConfig.enabled) {
        return {
            enabled: false,
            notion_summary: null
        };
    }

    // Use backend token from env if available, otherwise this feature requires env config
    const token = backendToken || process.env.NOTION_API_TOKEN;
    
    if (!token) {
        console.log('[Notion] No API token configured - skipping Notion integration');
        return {
            enabled: true,
            notion_summary: null,
            error: 'Notion API token not configured on server'
        };
    }

    // Require page ID
    if (!notionConfig.pageId) {
        return {
            enabled: true,
            notion_summary: null,
            error: 'No Notion page ID provided'
        };
    }

    // Fetch and process content
    const result = await fetchPageContent(notionConfig.pageId, token);
    
    if (!result.success) {
        return {
            enabled: true,
            notion_summary: null,
            error: result.error
        };
    }

    return {
        enabled: true,
        notion_summary: result.contentSummary,
        pageTitle: result.pageTitle,
        blockCount: result.blockCount
    };
}

module.exports = {
    ingestNotionContent,
    fetchPageContent,
    validateToken,
    extractPageId
};
