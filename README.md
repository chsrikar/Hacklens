# HackLens — Engineering Intelligence Platform

> **Created by [Chinthapenta Srikar](https://github.com/chinthapenta)**  
> _Core idea and architecture © 2026 Chinthapenta Srikar. All rights reserved._

HackLens transforms raw GitHub development data into actionable insights for engineering leaders. It analyzes contributor patterns, code change focus areas, and development progression, then generates executive-ready intelligence reports using AI. Now with visual analytics, persistent history, and exportable PDF reports.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![Made by Chinthapenta Srikar](https://img.shields.io/badge/Made%20by-Chinthapenta%20Srikar-orange.svg)](https://github.com/chinthapenta)

## 📑 Table of Contents

- [Current Features](#-current-features)
- [Who Should Use HackLens](#-who-should-use-hacklens)
- [Tech Stack](#-tech-stack)
- [Architecture & How It Works](#-architecture--how-it-works)
- [Workflow](#-workflow)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Database Setup](#database-setup-optional)
- [Project Structure](#project-structure)
- [Future Upgrades](#-future-upgrades)
- [Notes](#notes)
- [License](#license)

## ✨ Current Features

### Core Analytics
- 📊 **Visual Analytics Dashboard** — Interactive commit timeline charts, contributor activity graphs, and folder change heatmaps using Recharts
- 🤖 **AI-Powered Narratives** — Executive-ready intelligence reports generated using OpenRouter API (supports GPT-4, Claude, Gemini, and more)
- 📈 **Contributor Intelligence** — Deep insights into contributor patterns, collaboration dynamics, and individual impact metrics
- 🗂️ **Code Focus Areas** — Identify hotspots where development effort concentrates across folders and files
- ⏱️ **Commit Timeline Analysis** — Track development velocity and activity patterns over time

### Data & Export
- 💾 **Persistent History** — PostgreSQL-backed storage for historical analysis tracking and trend comparison
- 📄 **PDF Export** — Professional, server-rendered PDF reports via Puppeteer for stakeholder distribution
- 📊 **Real-time Repository Metrics** — Stars, forks, language breakdown, and repository metadata aggregation
- 🔄 **Comparative Analysis** — View historical trends and compare metrics across different time periods

### Developer Experience
- 🚀 **Zero-Config Start** — Works without database; optional PostgreSQL for enhanced features
- 🔐 **Flexible Authentication** — Support for GitHub Personal Access Tokens with graceful fallback
- ⚡ **Fast & Responsive** — Vite-powered frontend with hot module reloading
- 🎨 **Modern UI/UX** — Built with UnoCSS for utility-first, responsive design

## 👥 Who Should Use HackLens

HackLens is designed for teams and individuals who need to understand development patterns and project health:

### Engineering Managers & Team Leads
- Track team velocity and contribution patterns
- Identify areas of concentrated development effort
- Generate executive reports for stakeholder updates
- Monitor codebase evolution and technical focus areas

### Open Source Maintainers
- Understand contributor engagement and activity
- Identify which parts of the project receive the most attention
- Track project growth and community health metrics
- Generate reports for funding applications or community updates

### Technical Writers & Documentation Teams
- Identify codebases that need documentation based on change frequency
- Find high-activity areas that may need updated documentation
- Track which components are actively developed vs. stable

### DevRel & Developer Advocates
- Analyze community contribution patterns
- Create compelling data-driven stories about project growth
- Generate visual reports for blog posts and presentations
- Track engagement metrics for developer communities

### Product Managers
- Understand where engineering effort is being spent
- Validate technical roadmap alignment with actual development
- Generate insights for quarterly business reviews
- Track technical debt accumulation in specific modules

### Individual Developers & Tech Leads
- Audit repositories before joining a team or contributing
- Understand project structure and active development areas
- Benchmark your contributions against project norms
- Identify opportunities to contribute to open source projects

## 🛠️ Tech Stack

### Frontend Layer
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI framework | 18.3+ |
| **Vite** | Build tool & dev server | 6.0+ |
| **UnoCSS** | Utility-first CSS framework | 0.65+ |
| **Recharts** | Data visualization library | 2.15+ |
| **React Router** | Client-side routing | 6.28+ |
| **jsPDF** | Client-side PDF generation | 4.1+ |
| **html2canvas** | DOM to canvas rendering | 1.4+ |

### Backend Layer
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | 18.0+ |
| **Express** | Web framework | 4.21+ |
| **CORS** | Cross-origin resource sharing | 2.8+ |
| **dotenv** | Environment configuration | 16.4+ |
| **UUID** | Unique identifier generation | 11.0+ |

### External Services
| Service | Purpose | Required |
|---------|---------|----------|
| **GitHub REST API** | Repository data fetching | Yes |
| **OpenRouter API** | AI narrative generation | Optional |
| **PostgreSQL** | Persistent data storage | Optional |
| **Puppeteer** | Server-side PDF rendering | Optional |

### Development Tools
- **Node Watch** — Hot reloading for backend development
- **Vite HMR** — Hot module replacement for frontend
- **ES Modules** — Modern JavaScript module system

## 🏗️ Architecture & How It Works

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Port 5173)                                │ │
│  │  • Landing Page   • Dashboard   • History View             │ │
│  │  • Charts (Recharts)   • PDF Generation (jsPDF)            │ │
│  └───────────────────────┬────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/REST API
                             ▼
         ┌───────────────────────────────────────────┐
         │   Express Backend (Port 3001)             │
         │  ┌─────────────────────────────────────┐  │
         │  │  API Routes Layer                   │  │
         │  │  • /api/analyze                     │  │
         │  │  • /api/history/:owner/:repo        │  │
         │  │  • /api/export-pdf                  │  │
         │  │  • /api/health                      │  │
         │  └──────────────┬──────────────────────┘  │
         │                 ▼                          │
         │  ┌─────────────────────────────────────┐  │
         │  │  Services Layer                     │  │
         │  │  ┌─────────────────────────────┐    │  │
         │  │  │ GitHub Service              │    │  │
         │  │  │ • Fetch commits, contributors│   │  │
         │  │  │ • Repository metadata        │    │  │
         │  │  └─────────────────────────────┘    │  │
         │  │  ┌─────────────────────────────┐    │  │
         │  │  │ Data Processor              │    │  │
         │  │  │ • Parse & normalize data    │    │  │
         │  │  │ • Calculate metrics         │    │  │
         │  │  └─────────────────────────────┘    │  │
         │  │  ┌─────────────────────────────┐    │  │
         │  │  │ Aggregation Service         │    │  │
         │  │  │ • Folder change analysis    │    │  │
         │  │  │ • Timeline generation       │    │  │
         │  │  └─────────────────────────────┘    │  │
         │  │  ┌─────────────────────────────┐    │  │
         │  │  │ AI Service                  │    │  │
         │  │  │ • OpenRouter integration    │    │  │
         │  │  │ • Narrative generation      │    │  │
         │  │  └─────────────────────────────┘    │  │
         │  │  ┌─────────────────────────────┐    │  │
         │  │  │ Memory Service              │    │  │
         │  │  │ • In-memory or DB storage   │    │  │
         │  │  │ • Analysis history          │    │  │
         │  │  └─────────────────────────────┘    │  │
         │  └─────────────────────────────────────┘  │
         └────┬──────────────────────────┬───────────┘
              │                          │
              ▼                          ▼
    ┌──────────────────┐    ┌─────────────────────┐
    │ GitHub REST API  │    │ OpenRouter API      │
    │ • Commits        │    │ • GPT-4             │
    │ • Contributors   │    │ • Claude            │
    │ • Repository     │    │ • Gemini            │
    └──────────────────┘    └─────────────────────┘
              │
              ▼
    ┌──────────────────┐
    │ PostgreSQL DB    │
    │ (Optional)       │
    │ • analyses       │
    │ • repositories   │
    └──────────────────┘
```

### How It Works: Data Flow

#### 1. **User Input Phase**
```
User enters repo URL → Frontend validates format → Sends to /api/analyze
```

#### 2. **Data Collection Phase**
```
Backend receives request
    ↓
GitHub Service fetches:
    • Repository metadata (name, stars, forks, language)
    • Commit history (messages, authors, timestamps, files changed)
    • Contributor statistics (commits, additions, deletions)
    ↓
Data stored in memory/database
```

#### 3. **Processing Phase**
```
Data Processor normalizes raw GitHub data
    ↓
Aggregation Service computes:
    • Folder-level change frequency
    • Daily commit timeline
    • Per-contributor activity metrics
    • File change heatmap data
    ↓
Structured analytics ready for display
```

#### 4. **AI Enhancement Phase** (Optional)
```
AI Service sends structured data to OpenRouter
    ↓
AI generates four narratives:
    • Development progression story
    • Contributor dynamics analysis
    • Code change focus summary
    • Recent activity snapshot
    ↓
Narratives merged with analytics
```

#### 5. **Presentation Phase**
```
Complete analysis returned to frontend
    ↓
React components render:
    • Interactive charts (Recharts)
    • AI narratives (formatted text)
    • Contributor cards
    • Folder heatmap
    ↓
User can export to PDF or view in dashboard
```

#### 6. **Persistence Phase** (If database configured)
```
Analysis saved to PostgreSQL
    ↓
Accessible via /api/history endpoint
    ↓
Historical comparisons and trending available
```

### Key Design Principles

- **Graceful Degradation**: Works without AI, database, or GitHub token with reduced functionality
- **Separation of Concerns**: Routes → Services → Data layers cleanly separated
- **Stateless API**: Each analysis is independent; state stored in database if configured
- **Rate Limit Aware**: Respects GitHub API limits with intelligent request batching
- **Async/Await**: Non-blocking operations throughout the stack

## 🔄 Workflow

### Typical User Journey

```
1. Landing Page
   └─→ User enters GitHub repository URL
       └─→ (Optional) Provides GitHub Personal Access Token
           └─→ Click "Analyze Repository"

2. Analysis Phase
   └─→ Loading screen displays
       └─→ Backend fetches data from GitHub API
           └─→ Data processing & aggregation occurs
               └─→ AI generates narratives (if configured)

3. Dashboard Presentation
   └─→ Interactive visualizations render:
       ├─→ Commit Timeline Chart (activity over time)
       ├─→ Contributor Activity Chart (top contributors)
       ├─→ Folder Heatmap (change concentration)
       └─→ AI Narratives (development insights)
   └─→ User actions available:
       ├─→ Download PDF report
       ├─→ View detailed contributor stats
       └─→ Navigate to History page

4. History & Comparison
   └─→ View all past analyses for repository
       └─→ Compare metrics across different dates
           └─→ Track trends and evolution
```

### Developer Workflow

```
Development → Build → Analysis → Export → Share
    ↓          ↓        ↓         ↓        ↓
  Code on    Watch    Generate  Create   Distribute
  GitHub     changes  insights   PDF     to team
```

### Analysis Workflow (Technical)

```mermaid
graph TD
    A[User Submits Repo URL] --> B{GitHub Token Provided?}
    B -->|Yes| C[Use Authenticated API - 5000 req/hr]
    B -->|No| D[Use Public API - 60 req/hr]
    C --> E[Fetch Repository Metadata]
    D --> E
    E --> F[Fetch Commit History]
    F --> G[Fetch Contributor Statistics]
    G --> H[Process & Aggregate Data]
    H --> I{AI Service Available?}
    I -->|Yes| J[Generate AI Narratives]
    I -->|No| K[Use Placeholder Text]
    J --> L[Combine Data + Narratives]
    K --> L
    L --> M{Database Configured?}
    M -->|Yes| N[Save to PostgreSQL]
    M -->|No| O[Keep in Memory]
    N --> P[Return Complete Analysis]
    O --> P
    P --> Q[Render Dashboard]
    Q --> R{User Action}
    R -->|Export| S[Generate PDF]
    R -->|History| T[Fetch Past Analyses]
    R -->|New Analysis| A
```

## Quick Start

### 1. Clone & configure environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your API keys:

```
GITHUB_TOKEN=ghp_your_personal_access_token
OPENROUTER_API_KEY=sk-or-v1-your_api_key
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/hacklens
```

- **GITHUB_TOKEN** — [Create a GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` scope (read-only is fine). Without a token, you are limited to 60 API requests/hour.
- **OPENROUTER_API_KEY** — [Get an OpenRouter key](https://openrouter.ai/keys) for AI narrative generation.
- **DATABASE_URL** — Optional. PostgreSQL connection string for persistent analysis history. The app works fully without it.

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run the application

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Runs on http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. Enter any public GitHub repository URL (e.g. `https://github.com/facebook/react`)
2. Optionally paste a GitHub Personal Access Token for higher rate limits
3. Click **Analyze Repository**
4. View the dashboard with AI-generated narratives, interactive charts, contributor breakdown, folder heatmap, and activity snapshot
5. Click **Download PDF** to export a professional report
6. Click **History** to view past analyses and compare metrics

## API Reference

### `POST /api/analyze`

**Request:**

```json
{
  "repoUrl": "https://github.com/owner/repo",
  "githubToken": "ghp_xxxxx"
}
```

**Response:**

```json
{
  "repoMetadata": {
    "name": "repo-name",
    "owner": "owner-name",
    "description": "...",
    "stars": 1234,
    "forks": 56,
    "language": "JavaScript",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-02-12T00:00:00Z"
  },
  "contributors": [
    {
      "username": "user1",
      "avatarUrl": "https://...",
      "commits": 150,
      "additions": 5000,
      "deletions": 2000
    }
  ],
  "folderChanges": {
    "src/": 450,
    "tests/": 120
  },
  "commitTimeline": [
    { "date": "2026-01-01", "count": 4 },
    { "date": "2026-01-02", "count": 7 }
  ],
  "contributorActivity": [
    { "username": "user1", "commits": 22 },
    { "username": "user2", "commits": 4 }
  ],
  "folderHeatmap": [
    { "folder": "src/components", "changes": 120 },
    { "folder": "public/assets", "changes": 60 }
  ],
  "aiSummary": {
    "developmentNarrative": "...",
    "contributorsNarrative": "...",
    "codeChangeSummary": "...",
    "recentActivitySnapshot": "..."
  },
  "analysisId": "uuid-if-database-configured"
}
```

### `GET /api/history/:owner/:repo`

Returns all past analyses for a repository sorted by date, with comparison deltas.

### `POST /api/export-pdf`

**Request:**

```json
{
  "analysisId": "uuid",
  "analysisData": { }
}
```

**Response:** `application/pdf` binary buffer.

### `GET /api/health`

Returns `{ "status": "ok", "service": "HackLens API", "database": "connected|not configured" }`.

## Database Setup (Optional)

HackLens works fully without a database. To enable persistent history:

1. Install PostgreSQL
2. Create a database: `createdb hacklens`
3. Set `DATABASE_URL` in `.env`
4. Tables are auto-created on first server start

Manual schema: see `backend/src/db/migration.sql`

## Project Structure

```
hacklens/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── CommitTimelineChart.jsx
│   │   │   │   ├── ContributorActivityChart.jsx
│   │   │   │   └── FolderHeatmapChart.jsx
│   │   │   ├── RepoInputCard.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── ErrorBanner.jsx
│   │   │   ├── NarrativeSection.jsx
│   │   │   ├── ContributorsList.jsx
│   │   │   ├── ActivitySnapshot.jsx
│   │   │   └── FolderChangeHeatmap.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── uno.config.js
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── migration.sql
│   │   ├── routes/
│   │   │   ├── analyze.js
│   │   │   ├── history.js
│   │   │   └── exportPdf.js
│   │   ├── services/
│   │   │   ├── githubService.js
│   │   │   ├── aiService.js
│   │   │   ├── dataProcessor.js
│   │   │   ├── aggregationService.js
│   │   │   ├── memoryService.js
│   │   │   └── pdfService.js
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   └── errorHandler.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🚀 Future Upgrades

### Planned Enhancements

#### Short-term (v2.0)
- [ ] **Multi-Repository Comparison** — Side-by-side analysis of multiple repositories
- [ ] **Real-time Webhooks** — Live updates when new commits are pushed
- [ ] **Custom Date Ranges** — Analyze specific time periods instead of full history
- [ ] **Export Formats** — Excel, CSV, and JSON data export options
- [ ] **Dark Mode** — Theme toggle for better UX
- [ ] **Advanced Filtering** — Filter by contributor, file type, or folder path

#### Mid-term (v2.5)
- [ ] **Team Analytics** — Organization-level insights across multiple repositories
- [ ] **Caching Layer** — Redis integration for faster repeated analyses
- [ ] **Code Quality Metrics** — Integration with SonarQube, CodeClimate
- [ ] **Pull Request Analytics** — Review time, approval patterns, merge statistics
- [ ] **Issue Correlation** — Link commits to issues and track resolution patterns
- [ ] **Custom AI Models** — Support for local LLMs (Ollama, LM Studio)
- [ ] **Slack/Discord Integration** — Automated report delivery to channels
- [ ] **Email Reports** — Scheduled analysis reports via email

#### Long-term (v3.0)
- [ ] **Predictive Analytics** — Forecast technical debt and maintenance needs using ML
- [ ] **Security Analysis** — Vulnerability detection and secret scanning integration
- [ ] **CI/CD Integration** — Automated analysis on deployment pipelines
- [ ] **Custom Dashboards** — User-configurable widgets and metrics
- [ ] **API Rate Optimization** — GraphQL integration for more efficient GitHub queries
- [ ] **Multi-Language Support** — I18n for global teams
- [ ] **Mobile App** — Native iOS/Android applications
- [ ] **Plugin System** — Extensible architecture for custom analyzers
- [ ] **Collaboration Features** — Comments, annotations, and shared insights
- [ ] **Advanced AI Insights** — Code smell detection, refactoring suggestions

### Community Contributions Welcome

We welcome contributions in the following areas:
- 🐛 Bug fixes and stability improvements
- 📝 Documentation enhancements
- 🎨 UI/UX improvements
- 🔧 New data aggregation algorithms
- 🤖 Additional AI model integrations
- 🌐 Internationalization
- 🧪 Test coverage expansion

See our [Contributing Guidelines](#) (coming soon) for more details.

## Notes

- **No code quality scoring** — HackLens focuses on patterns and activity, not judgments
- **AI graceful fallback** — If the OpenRouter API is unavailable, the dashboard still renders all data with placeholder text
- **Database optional** — The app functions fully without PostgreSQL; history and persistence are additive features
- The frontend proxies `/api` requests to the backend in development via Vite config
- GitHub API is limited to 60 req/hour without a token; 5,000 req/hour with one

## 📄 License

MIT License

**Copyright © 2026 Chinthapenta Srikar**

The core idea, concept, and architecture of HackLens are the intellectual property of **Chinthapenta Srikar**.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

**Made by [Chinthapenta Srikar](https://github.com/chinthapenta)**
