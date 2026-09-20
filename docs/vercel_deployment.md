# Deploying Roxstar AI Voice Room Assistant to Vercel

This repository is pre-configured to deploy seamlessly to **Vercel** with Next.js frontend and Python FastAPI Serverless Functions.

---

## 1. Quick Deployment via Vercel Dashboard

1. **Push to GitHub**:
   Push your project repository to GitHub, GitLab, or Bitbucket.

2. **Import Project into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and log in.
   - Select your repository (`roxstar-ai-voice-room`).
   - Vercel automatically detects `vercel.json`, `frontend/package.json`, and `api/index.py`.

3. **Configure Environment Variables**:
   In the Vercel project settings under **Environment Variables**, add:

   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `LIVEKIT_URL` | `wss://roxstar-7sre7lmn.livekit.cloud` | Your LiveKit Cloud WebSockets URL |
   | `LIVEKIT_API_KEY` | `APIb8MdCAAuc7Nv` | LiveKit API Key |
   | `LIVEKIT_API_SECRET` | `jOxQriSIkXqSrQWkevVoILFYfPh9k6sP8nn5GeHY1fyB` | LiveKit Secret Key |
   | `GROQ_API_KEY` | `gsk_aiyUQq7q...` | Groq API Key for fast LLM |
   | `LLM_PROVIDER` | `groq` | LLM Provider |
   | `LLM_MODEL` | `groq/compound-mini` | Groq Model ID |
   | `STT_API_KEY` | `your_deepgram_key` | Deepgram STT API Key (optional) |
   | `TTS_API_KEY` | `your_elevenlabs_key` | ElevenLabs TTS API Key (optional) |

4. **Click Deploy**:
   Vercel will build the Next.js app and Python API serverless functions into a single live production URL!

---

## 2. Deploying via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Log in to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 3. How Vercel Deployment Works

- **Frontend Routes (`/`)**: Built using `@vercel/next` from `frontend/package.json`.
- **Backend API (`/api/*`)**: Built using `@vercel/python` from `api/index.py` (which exposes the FastAPI application).
- **Environment Variables**: Automatically injected into the Python serverless function runtime and Next.js client.
