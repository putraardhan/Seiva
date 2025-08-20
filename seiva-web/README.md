# Seiva Web – Frontend for Sei Network AI Assistant

## Overview
**Seiva Web** is the web-based frontend of the Seiva project.  
It provides a clean UI for exploring Sei tokens, wallets, and ecosystem projects, and acts as a demo hub for the DoraHacks x Sei Hackathon submission.

This app is built with **Next.js (App Router)**, **React**, and styled using **TailwindCSS**. It communicates with **n8n backend APIs** to fetch on-chain data.

---

## Features
- 📊 Token & wallet analytics displayed in web UI
- 🔎 Search and filter for Sei ecosystem projects
- 📘 Guides and tutorials for Sei users
- 🌐 Public demo hub (for users without Telegram)

---

## Getting Started

### 1. Clone and Install
git clone https://github.com/putraardhan/Seiva.git  
cd Seiva/seiva-web  
npm install  

### 2. Run Locally
npm run dev  
App will be available at: http://localhost:3000

---

## Environment Variables
Create a `.env.local` file in `seiva-web/` with:

N8N_WEBHOOK_URL=https://<your-n8n-host>/webhook/seiva-web  
NEXT_PUBLIC_APP_URL=https://seiva-web.vercel.app  

⚠️ Do **not** commit `.env.local` to GitHub. Instead, create a safe `.env.example` to show required keys.

---

## Build for Production
npm run build  
npm run start  

---

## Deployment
Seiva Web is deployed using **Vercel**.  
When importing the repo to Vercel:
- Set **Root Directory** → `seiva-web/`
- Build Command → `next build`
- Output Directory → `.next`
- Add Environment Variables in Vercel dashboard

---

## Folder Structure
```
seiva-web/  
├── app/              # Next.js App Router pages  
├── components/       # UI components  
├── public/           # Static assets  
├── styles/           # Tailwind/global CSS  
├── package.json  
├── tsconfig.json  
├── tailwind.config.cjs  
└── ...
```
---

## Tech Stack
- Next.js · React · TailwindCSS  
- Vercel (hosting)  
- n8n (backend API)  
- Sei RPC / REST endpoints  

---

## License
MIT License
