# InterviewLens

AI mock interviews + resume gap check. MERN stack with Gemini (free tier) for the LLM.

## Run it

Needs Node 18+ and MongoDB (local, or a free Atlas cluster).

```bash
# 1. API
cd server
cp .env.example .env      # fill GEMINI_API_KEY, JWT_SECRET, MONGO_URI
npm install
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Get a free Gemini key at https://aistudio.google.com/apikey

## How it works

1. You pick a role, level and type. The server asks the LLM for question 1.
2. You answer. The server asks the LLM to score it (0-10) with feedback, then generates the next question (avoiding repeats).
3. After the last answer the LLM writes a summary report. Everything is saved in MongoDB.
4. Resume check: paste resume + role, get match %, missing skills, better bullets.

## Structure

```
server/
  server.js            Express app + error handler
  models/              User, Interview (questions are an embedded array)
  routes/              auth, interviews, resume
  services/llm.js      the only file that talks to the LLM provider
  services/prompts.js  all prompts + output cleanup
client/src/
  api.js               fetch helper (adds JWT)
  context/AuthContext  login state shared across pages
  pages/               Auth, Dashboard, Interview (+Report), Resume
```

## Ideas to extend (good for your resume)

- Voice answers with the browser Web Speech API
- PDF resume upload (multer + pdf-parse)
- Score trend chart on the dashboard
- Rate limiting (express-rate-limit) and Dockerfile + GitHub Actions for the DevOps angle
- Deploy: Render (API), Vercel (client), MongoDB Atlas
