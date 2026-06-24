# Hierarchy Analyzer

A full-stack application for analyzing hierarchical relationships from node connections.

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite + Tailwind CSS

## Project Structure

```
Hierarchy/
├── backend/
│   ├── server.js          # Express server
│   ├── graph.js           # Graph utility functions
│   ├── package.json
│   ├── render.yaml        # Render deployment config
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── vercel.json        # Vercel deployment config
│   ├── .env.example
│   └── .gitignore
└── README.md
```

## Local Development

### Backend

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Go to [Render](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name:** hierarchy-analyzer-api
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variable:
   - `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app`
6. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com) → New Project
3. Import your GitHub repo
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
6. Deploy

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | localhost:5173,localhost:3000 |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | (empty - uses proxy) |

## API Endpoint

### POST /bfhl

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

**Response:**
```json
{
  "user_id": "kanavkumar_08092004",
  "email_id": "kanav2111.be23@chitkara.edu.in",
  "college_roll_number": "2310992111",
  "hierarchies": [...],
  "invalid_entries": [...],
  "duplicate_edges": [...],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```
