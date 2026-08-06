# Blogify - Full-Stack AI-Powered Blogging Platform

A full-stack blogging web application built with React (Vite), Express.js, Node.js, and MongoDB Atlas. Features AI text assistance (Gemini API), Cloudinary image uploads, JWT authentication, audio synthesis, and admin moderation dashboard.

---

## 🚀 Live Services & Deployment

- **Live Backend API**: [https://blogify-backend1.onrender.com](https://blogify-backend1.onrender.com)
- **Frontend App**: Configured for Vercel deployment with serverless proxy rewrites (`/api/*` → Render backend).
- **Database**: MongoDB Atlas (`blogdb`) with fail-safe in-memory MongoDB fallback.

---

## 📁 Repository Structure

```
Blogify-FullStack/
├── api/             # Vercel serverless entry point
├── client/          # Vite + React frontend application
├── scripts/         # Admin setup and utility scripts
├── server/          # Express backend REST API & Mongoose models
├── tests/           # Pytest & Selenium E2E automated testing suite
├── .env.example     # Environment variable template
├── render.yaml      # Render infrastructure configuration
├── server.js        # Root Express entry point for Render
└── vercel.json      # Vercel SPA routes & backend API rewrites
```

---

## 🛠️ Environment Variables

Copy `.env.example` to `.env` in both `/server` and `/client`:

```env
MONGODB_URI=mongodb+srv://blogify:Blogify12345@cluster0.u9ngkvc.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret
VITE_BASE_URL=https://blogify-backend1.onrender.com
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🏃 Local Development

```bash
# Install root dependencies
npm install

# Install client and server dependencies
npm run install-all

# Start application
npm start
```
