# HackLens 🔍

**GitHub Repository Intelligence Tool**

HackLens analyzes GitHub repositories and generates human-readable development summaries for team leads and authorities. Understand who contributed, where changes occurred, and how your project evolved — without opening GitHub manually.

## Features

- **👥 Contributors Overview** — See who worked on what and their focus areas
- **📁 Code Change Summary** — Understand where development effort was focused
- **📖 Development Narrative** — AI-generated story of project evolution

## Tech Stack

### Frontend
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Fetch API

### Backend
- Node.js
- Express.js
- GitHub REST API
- OpenRouter API (AI)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenRouter API key (for AI summaries)
- GitHub Personal Access Token (optional, for private repos)

### Installation

1. **Clone the repository**
   ```bash
   cd hacklens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   PORT=3000
   GITHUB_TOKEN=your_github_token
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## API Reference

### POST /api/analyze

Analyzes a GitHub repository and returns structured data with AI summary.

**Request:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "githubToken": "optional_token"
}
```

**Response:**
```json
{
  "repository": {
    "name": "repo",
    "owner": "owner",
    "url": "https://github.com/owner/repo"
  },
  "contributors": [
    {
      "name": "Contributor A",
      "commitCount": 23,
      "mainAreas": ["backend", "api"]
    }
  ],
  "changeSummary": {
    "mostChangedFolders": ["/src/api", "/src/services"],
    "newFiles": 14,
    "modifiedFiles": 38,
    "deletedFiles": 5,
    "totalCommits": 150
  },
  "aiSummary": {
    "contributorsSummary": "...",
    "changeSummary": "...",
    "developmentNarrative": "..."
  },
  "analyzedAt": "2025-01-04T10:30:00.000Z"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "HackLens",
  "timestamp": "2025-01-04T10:30:00.000Z"
}
```

## Project Structure

```
hacklens/
├── server.js                 # Express server entry point
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── public/                   # Frontend static files
│   ├── index.html           # Main HTML page
│   ├── css/
│   │   └── styles.css       # Stylesheet
│   └── js/
│       └── app.js           # Frontend JavaScript
└── src/
    ├── routes/
    │   └── analyze.js       # API route handlers
    ├── services/
    │   ├── github.js        # GitHub API integration
    │   └── ai.js            # OpenRouter AI integration
    └── utils/
        └── parser.js        # URL parsing utilities
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `GITHUB_TOKEN` | No | GitHub PAT for private repos & higher rate limits |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for AI summaries |

### GitHub Token

To create a GitHub Personal Access Token:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (for private repos) or `public_repo` (for public only)

### OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Navigate to API Keys
3. Create a new key

## Usage Notes

- **Rate Limits**: Without a GitHub token, you're limited to 60 requests/hour. With a token: 5000/hour.
- **Large Repos**: Analysis samples commits for repositories with 500+ commits to maintain speed.
- **AI Fallback**: If no OpenRouter key is provided, a basic summary is generated without AI.

## What This Tool Is NOT

- ❌ Not a performance scoring system
- ❌ Not a contributor ranking tool
- ❌ Not a code quality analyzer
- ❌ Not a project management tool

## Success Criteria

A team lead can understand:
- Who worked on what
- Where development effort was focused
- How the project evolved

**All without opening GitHub manually.**

## License

MIT

---

