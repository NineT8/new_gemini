# Auto-Research Agent

An intelligent AI-powered research assistant that automates comprehensive research on any topic using a multi-agent architecture with hybrid LLM processing.

## 🚀 Features

- **Hybrid LLM System**: Uses Groq for fast planning/execution and Gemini for verification/reports
- **Multi-Agent Architecture**: Specialized agents for planning, research, and verification
- **Real-time Progress**: Live timeline showing research progress and findings
- **Beautiful UI**: Modern, responsive interface with dark theme

## 📁 Project Structure

```
├── backend/                # Node.js backend server
│   ├── src/
│   │   ├── agent/         # Agent logic (controller, agents)
│   │   ├── tools/         # Search and scraping tools
│   │   ├── llm.js         # LLM integration (Groq + Gemini)
│   │   ├── memory.js      # Research memory management
│   │   └── server.js      # Express server
│   └── package.json
│
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── App.jsx        # Main application
│   │   └── index.css      # Styles
│   └── package.json
│
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Environment Variables

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 🏃 Running

### Development

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/research/start` | POST | Start a new research task |
| `/api/research/:id` | GET | Get research status |
| `/api/research/:id/stream` | GET | SSE stream for live updates |

## 🧠 Architecture

The system uses a **Plan-Execute-Verify** loop:

1. **Planning Agent** (Groq): Creates research strategy
2. **Research Agent** (Groq): Executes searches and gathers data
3. **Verification Agent** (Gemini): Validates findings
4. **Report Generator** (Gemini): Creates final research report

## 📄 License

MIT
