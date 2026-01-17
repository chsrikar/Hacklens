<p align="center">
  <img src="https://img.shields.io/badge/HackLens-Intelligence%20Tool-6366f1?style=for-the-badge&logo=github&logoColor=white" alt="HackLens Badge"/>
</p>

<h1 align="center">🔍 HackLens</h1>

<p align="center">
  <strong>GitHub Repository Intelligence Tool with AI-Powered Insights & Notion Integration</strong>
</p>

<p align="center">
  <a href="#-mission">Mission</a> •
  <a href="#-the-problem">Problem</a> •
  <a href="#-why-hacklens">Why HackLens</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/AI-OpenRouter-7C3AED?style=flat-square&logo=openai&logoColor=white" alt="OpenRouter"/>
  <img src="https://img.shields.io/badge/API-GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub API"/>
  <img src="https://img.shields.io/badge/API-Notion-000000?style=flat-square&logo=notion&logoColor=white" alt="Notion API"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"/>
</p>

---

## 🎯 Mission

**HackLens exists to transform raw repository data into decision-ready intelligence.**

We believe team leads, managers, and stakeholders shouldn't need to dig through GitHub manually to understand:
- *Who* contributed to a project
- *What* changed and where
- *How* the project evolved over time
- *Why* certain decisions were made (via Notion integration)

HackLens automates repository analysis and delivers professional, human-readable summaries in seconds — not hours.

---

## 🔥 The Problem

### The Pain Points We Solve

| Problem | Traditional Approach | HackLens Solution |
|---------|---------------------|-------------------|
| **Understanding a new codebase** | Manually browse commits, contributors, file structure | Instant AI-powered summary |
| **Contributor visibility** | Click through profiles one by one | Aggregated overview with focus areas |
| **Development activity tracking** | Scan commit history manually | Visual breakdown of changed folders |
| **Project evolution** | Read through months of commits | AI-generated development narrative |
| **Missing context** | No insight into "why" decisions were made | Notion integration for project intent |
| **Hackathon judging** | Review each submission manually | Quick intelligence briefs per repo |

### Who Benefits?

- **🧑‍💼 Team Leads** — Get instant visibility into team activity without micromanaging
- **👩‍⚖️ Hackathon Judges** — Evaluate submissions fairly with standardized analysis
- **🏢 Engineering Managers** — Understand project health across multiple repos
- **🆕 New Team Members** — Onboard faster with project context
- **📊 Stakeholders** — Stay informed without technical deep-dives

---

## 💡 Why HackLens?

### The HackLens Advantage

```
┌─────────────────────────────────────────────────────────────────┐
│                     TRADITIONAL WAY                             │
│                                                                 │
│   Open GitHub → Browse commits → Check contributors →           │
│   Click profiles → Read commit messages → Open Notion →         │
│   Cross-reference → Take notes → Compile summary                │
│                                                                 │
│   ⏱️ Time: 30-60 minutes per repository                        │
└─────────────────────────────────────────────────────────────────┘

                              VS

┌─────────────────────────────────────────────────────────────────┐
│                      HACKLENS WAY                               │
│                                                                 │
│   Paste URL → Click Analyze → Get Intelligence Brief            │
│                                                                 │
│   ⏱️ Time: 10-30 seconds                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **🎯 Accuracy First** — Contributor counts match GitHub UI exactly
2. **🤖 Bot-Aware** — Automated accounts are detected and excluded from human summaries
3. **📊 No Duplicates** — Contributors are deduplicated by login (primary) and ID (secondary)
4. **🔒 Secure by Design** — Tokens are never exposed to frontend; Notion content is never logged
5. **⚡ Graceful Degradation** — Works without AI, without Notion, without GitHub token

---

## ✨ Features

### 🔍 Repository Analysis
- **Repository Overview** — Name, description, language, topics, stars, forks
- **Contributor Mapping** — Who worked on what, with focus areas
- **Change Summary** — Most active folders, new/modified/deleted files
- **Commit Intelligence** — Recent commits with author attribution

### 🤖 AI-Powered Insights
- **Repository Purpose** — What the project is and who it's for
- **Development Narrative** — How the codebase evolved over time
- **Contributors Summary** — Key contributors and their impact
- **Change Analysis** — Where development effort concentrated

### 📝 Notion Integration (Optional)
- **Project Intent** — Understand *why* decisions were made
- **Planning Context** — Roadmaps, goals, design decisions
- **Vision Enrichment** — Future direction from documentation
- **Secure Processing** — Token managed server-side only

### ✅ Data Integrity
- **Source of Truth** — GitHub Contributors API for accurate counts
- **Deduplication** — No contributor appears twice
- **Bot Detection** — `[bot]` accounts automatically filtered
- **Validation** — Every response includes integrity checks

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | Runtime environment |
| **Express.js 4.x** | HTTP server & routing |
| **dotenv** | Environment configuration |
| **cors** | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Custom properties, Grid, Flexbox |
| **Vanilla JavaScript** | ES6+ with Fetch API |

### External APIs & Integrations
| API | Purpose | Required |
|-----|---------|----------|
| **GitHub REST API** | Repository data, commits, contributors | ✅ Yes |
| **OpenRouter API** | AI-powered summary generation | ✅ Yes |
| **Notion API** | Project planning & intent context | ⚠️ Optional |

### AI Model
- **Provider**: OpenRouter (unified AI gateway)
- **Model**: `openai/gpt-3.5-turbo`
- **Fallback**: Basic summary generation without AI

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **OpenRouter API Key** for AI summaries ([Get one](https://openrouter.ai))
- **GitHub Token** (optional, for private repos or higher rate limits)
- **Notion Integration Token** (optional, for Notion context)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/hacklens.git
cd hacklens

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys (see Environment Variables section)

# 4. Start the server
npm start
# Or for development with auto-reload:
npm run dev

# 5. Open in browser
# http://localhost:8080
```

---

## 📁 Project Structure

```
hacklens/
├── 📄 server.js                 # Express server entry point
├── 📄 package.json              # Dependencies & npm scripts
├── 📄 .env                      # Environment variables (not committed)
├── 📄 .env.example              # Environment template
├── 📄 .gitignore                # Git ignore rules
├── 📄 README.md                 # This file
│
├── 📂 public/                   # Frontend static files
│   ├── 📄 index.html           # Main HTML page
│   ├── 📂 css/
│   │   └── 📄 styles.css       # Stylesheet with CSS custom properties
│   └── 📂 js/
│       └── 📄 app.js           # Frontend JavaScript (Fetch API)
│
└── 📂 src/                      # Backend source code
    ├── 📂 routes/
    │   └── 📄 analyze.js       # API route handlers (/api/analyze, /api/health)
    │
    ├── 📂 services/
    │   ├── 📄 github.js        # GitHub API integration (538 lines)
    │   │                        # - Repository metadata
    │   │                        # - Contributors API (source of truth)
    │   │                        # - Commit history with pagination
    │   │                        # - Bot detection & deduplication
    │   │
    │   ├── 📄 ai.js            # OpenRouter AI integration (487 lines)
    │   │                        # - Professional analyst prompts
    │   │                        # - JSON response parsing
    │   │                        # - Fallback basic summaries
    │   │
    │   └── 📄 notion.js        # Notion API integration (391 lines)
    │                            # - Page content extraction
    │                            # - Block parsing (headings, paragraphs, lists)
    │                            # - URL/ID normalization
    │
    └── 📂 utils/
        └── 📄 parser.js        # URL parsing utilities
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080

# GitHub API (optional - for private repos or higher rate limits)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# OpenRouter API (required for AI summaries)
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key

# Notion API (optional - for project context enrichment)
NOTION_API_TOKEN=ntn_your_notion_integration_token
```

### Variable Details

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `GITHUB_TOKEN` | No | — | GitHub PAT for private repos & 5000 req/hr rate limit |
| `OPENROUTER_API_KEY` | No | — | Enables AI-powered summaries |
| `NOTION_API_TOKEN` | No | — | Enables Notion context integration |

### Getting API Keys

<details>
<summary><strong>🔑 GitHub Personal Access Token</strong></summary>

1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens**
2. Click **Generate new token (classic)**
3. Select scopes:
   - `repo` — For private repositories
   - `public_repo` — For public repositories only
4. Copy the token to your `.env` file
</details>

<details>
<summary><strong>🔑 OpenRouter API Key</strong></summary>

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Navigate to **API Keys**
3. Create a new key
4. Copy to your `.env` file
</details>

<details>
<summary><strong>🔑 Notion Integration Token</strong></summary>

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Name it (e.g., "HackLens")
4. Select your workspace
5. Copy the **Internal Integration Token**
6. **Important**: Share pages with your integration:
   - Open the Notion page
   - Click **...** → **Add connections** → Select your integration
</details>

---

## 📡 API Reference

### `POST /api/analyze`

Analyzes a GitHub repository and returns structured intelligence data.

**Request:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "githubToken": "optional_override_token",
  "notion": {
    "enabled": true,
    "pageId": "notion-page-id-or-url"
  }
}
```

**Response:**
```json
{
  "repository": {
    "name": "repo",
    "owner": "owner",
    "fullName": "owner/repo",
    "url": "https://github.com/owner/repo",
    "description": "Repository description",
    "primaryLanguage": "JavaScript",
    "topics": ["nodejs", "api"],
    "stars": 1234,
    "forks": 56,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
  },
  "contributors": [
    {
      "login": "contributor1",
      "contributions": 150,
      "mainAreas": ["src/api", "tests"]
    }
  ],
  "bots": [
    {
      "login": "dependabot[bot]",
      "contributions": 25
    }
  ],
  "counts": {
    "totalContributors": 15,
    "humanContributors": 14,
    "botAccounts": 1,
    "totalCommits": 500
  },
  "changeSummary": {
    "totalCommits": 500,
    "mostChangedFolders": ["src/api", "src/services"],
    "newFiles": 45,
    "modifiedFiles": 120,
    "deletedFiles": 12
  },
  "aiSummary": {
    "repositoryPurpose": "AI-generated project purpose...",
    "notionSummary": "Context from Notion page...",
    "contributorsSummary": "Key contributors overview...",
    "changeSummary": "Development focus areas...",
    "developmentNarrative": "How the project evolved..."
  },
  "notionContext": {
    "enabled": true,
    "hasContent": true,
    "pageTitle": "Project Planning",
    "error": null
  },
  "validation": {
    "contributorCountMatchesAPI": true,
    "noDuplicateContributors": true,
    "hasRepositoryPurpose": true,
    "isValid": true
  },
  "analyzedAt": "2025-01-17T12:00:00.000Z"
}
```

### `GET /api/health`

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "HackLens",
  "timestamp": "2025-01-17T12:00:00.000Z"
}
```

---

## 📋 Usage Notes

### Rate Limits

| Configuration | GitHub Rate Limit |
|--------------|-------------------|
| No token | 60 requests/hour |
| With token | 5,000 requests/hour |

### Performance Optimizations

- **Commit Sampling**: Repositories with 500+ commits are sampled for speed
- **Parallel Requests**: Metadata, contributors, and commits fetched concurrently
- **Content Truncation**: Notion content capped at 3,000 characters for AI context

### Fallback Behavior

| Missing Component | Behavior |
|-------------------|----------|
| No OpenRouter key | Basic summary generated (no AI) |
| No Notion token | Analysis works without project context |
| No GitHub token | Works for public repos (lower rate limit) |
| Notion page not shared | Graceful error, analysis continues |

---

## 📊 Data Source Philosophy

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATA SOURCE HIERARCHY                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐                     ┌─────────────┐           │
│   │   GITHUB    │ ◄─── Source of ───► │   NOTION    │           │
│   │             │      Truth for      │             │           │
│   │  WHAT       │      Activity       │  WHY        │           │
│   │  happened   │                     │  decisions  │           │
│   │             │                     │  were made  │           │
│   └─────────────┘                     └─────────────┘           │
│        │                                    │                    │
│        ▼                                    ▼                    │
│   • Commits                           • Project vision           │
│   • Contributors                      • Design decisions         │
│   • File changes                      • Roadmap & goals          │
│   • Repository metadata               • Planning context         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Golden Rules

1. **GitHub is always the source of truth** for development activity
2. **Notion enriches but never overrides** GitHub data
3. **Contributor counts must match** what GitHub UI shows
4. **Missing Notion never breaks** the analysis
5. **Bot accounts are always separated** from human contributors

---

## ❌ What This Tool Is NOT

| ❌ NOT This | ✅ What It Actually Is |
|-------------|----------------------|
| Performance scoring system | Intelligence aggregation tool |
| Contributor ranking tool | Neutral activity visualization |
| Code quality analyzer | Development pattern observer |
| Project management tool | Read-only analysis utility |
| CI/CD integration | On-demand analysis service |
| Real-time monitoring | Point-in-time snapshots |
| Code review system | High-level overview generator |

---

## 🎯 Success Criteria

HackLens succeeds when a team lead can answer these questions **without opening GitHub**:

| Question | How HackLens Answers |
|----------|---------------------|
| Who worked on this project? | Contributors list with focus areas |
| What was the development focus? | Most changed folders & file stats |
| How did the project evolve? | AI-generated development narrative |
| What is this project for? | Repository purpose summary |
| Why were these decisions made? | Notion context integration |

**Target**: Complete repository intelligence in **under 30 seconds**.

---

## 🔮 Future Upgrade Ideas

### Short-Term Roadmap
- [ ] **Multi-repository comparison** — Analyze multiple repos side-by-side
- [ ] **Export to PDF/Markdown** — Generate shareable reports
- [ ] **Caching layer** — Redis/in-memory cache for repeated analyses
- [ ] **Webhook support** — Trigger analysis on push events
- [ ] **Dark/Light theme toggle** — User preference for UI

### Medium-Term Vision
- [ ] **Team analytics** — Aggregate insights across organization repos
- [ ] **Historical trends** — Track development patterns over time
- [ ] **Slack/Discord integration** — Post summaries to team channels
- [ ] **Custom AI prompts** — User-defined analysis focus areas
- [ ] **Multiple AI model support** — GPT-4, Claude, Llama options

### Long-Term Goals
- [ ] **Organization-wide dashboard** — SaaS-ready multi-tenant support
- [ ] **GitHub App integration** — One-click installation for orgs
- [ ] **Jira/Linear integration** — Link issues to development activity
- [ ] **Machine learning insights** — Predict development bottlenecks
- [ ] **API rate limit pooling** — Multiple token rotation

---

## 🏆 Key Developments

### Version 1.1.0 (Current)
- ✅ **Notion Integration** — Full page content extraction with block parsing
- ✅ **Enhanced AI Prompts** — Professional analyst tone, no system phrases
- ✅ **Bot Detection** — Automatic `[bot]` account filtering
- ✅ **Data Validation** — Contributor count verification against GitHub API
- ✅ **Deduplication Engine** — Login-based + ID-based contributor merging

### Version 1.0.0
- ✅ Core GitHub analysis
- ✅ OpenRouter AI integration
- ✅ Basic frontend UI
- ✅ Express.js backend

---

## 🔒 Security Considerations

| Concern | Mitigation |
|---------|------------|
| Token exposure | API tokens stored server-side only, never sent to frontend |
| Notion content logging | Raw Notion content is never logged |
| GitHub token in requests | Frontend token is optional override, environment token preferred |
| Rate limit abuse | Graceful error handling with user feedback |
| API key in source control | `.env` file gitignored, `.env.example` provided |

---

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:8080/api/health

# Analyze public repository
curl -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/expressjs/express"}'

# Analyze with Notion context
curl -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/your/repo",
    "notion": {
      "enabled": true,
      "pageId": "your-notion-page-id"
    }
  }'
```

### Expected Validation Results

```json
{
  "validation": {
    "contributorCountMatchesAPI": true,
    "noDuplicateContributors": true,
    "hasRepositoryPurpose": true,
    "isValid": true
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 HackLens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  <strong>Built By Chinthapenta Srikar</strong>
</p>

<p align="center">
  <a href="#-hacklens">Back to Top ↑</a>
</p>
