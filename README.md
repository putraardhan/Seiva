# Seiva – AI Assistant for Sei Network

## Project Description
**Seiva** is an AI-powered assistant for the Sei Network, consisting of:
1. **Seiva Bot** – a Telegram bot that helps users track wallets, analyze tokens, and get contextual insights about Sei.
2. **Seiva Web** – a web-based frontend to showcase Seiva’s features, provide guides, and allow non-Telegram users to explore the Sei ecosystem.

This project was created for the **DoraHacks x Sei Hackathon** to increase accessibility, transparency, and usability of the Sei blockchain ecosystem.

---

## Features

### 🔹 Seiva Bot (Telegram)
- Track wallet activity on Sei (multi-token support)
- Ask intelligent questions about Sei with contextual AI responses
- Token insights: price, volume, holders, historical changes
- Assistance for airdrops, staking, bridging, and ecosystem guides
- Built with **n8n**, **OpenAI API**, **DexScreener integration**, and **Sei RPC endpoints**

### 🔹 Seiva Web
- Frontend dashboard for exploring Sei projects
- Token & wallet analytics displayed on web
- Guides and tutorials for Sei users
- Demo hub for hackathon judges and community
- Built with **Next.js/React**, styled with TailwindCSS

---

## Demo
- [Watch the demo video here](https://www.youtube.com/watch?v=AK440aOmV64)  
- Telegram Bot: [@SeivaBot](https://t.me/sei_vabot)  
- Web (soon): [seiva-web.vercel.app](https://seiva-web.vercel.app) *(placeholder, update with real link after deploy)*

---

## Folder Structure
seiva/
│
├── seiva-bot/ # Telegram bot code & workflows
│ ├── workflows/ # n8n workflow exports
│ ├── prompts/ # OpenAI system prompts
│ └── README.md # Bot-specific documentation
│
├── seiva-web/ # Frontend web app
│ ├── pages/ # Next.js pages
│ ├── components/ # UI components
│ ├── public/ # Static assets
│ └── README.md # Web-specific documentation
│
└── README.md # This main file

---

## Example Bot Commands
- `/wallet <address>` → check wallet balance & tokens  
- `/token <address>` → analyze token details  
- `/ask <question>` → ask anything about Sei ecosystem  

---

## Tech Stack
- **Seiva Bot:** n8n · Telegram Bot API · OpenAI · Sei RPC/REST · DexScreener API  
- **Seiva Web:** Next.js · React · TailwindCSS · Vercel hosting  

---

## Socials
- Telegram: [@SeivaBot](https://t.me/sei_vabot)  
- Twitter: [@seiva_assistant](https://x.com/seiva_assistant)  

---

## License
This project is licensed under the **MIT License**.
