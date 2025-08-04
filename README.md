# TrueType — Plagiarism Detection System (Frontend)

Welcome to the **TrueType** Plagiarism Detection System. This repository contains the **frontend application** built with **React** and **Tailwind CSS**.

> 🔍 TrueType helps users detect content similarity across multiple documents, assisting in academic integrity, content originality, and research writing.

---

## 📁 Project Structure

This repository contains only the **frontend** of the application.

- ✅ **React** — for interactive UI components
- 🎨 **Tailwind CSS** — for modern, utility-first styling
- 🔌 Connects to a backend (not included in this repo) that handles file analysis, matching algorithms, and reporting

---

## 🚀 Features

- Upload multiple documents for plagiarism checks
- View similarity reports and highlighted matches
- User authentication and role-based access
- upload texts for plagiarism checks

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/truetype.git
cd truetype
npm install

## 🧪 Running the App (Development)
npm run dev

By default, the app will run on: http://localhost:5173
Make sure your backend API is running and properly configured in the .env file.

⚙️ Environment Variables
Create a .env file in the root directory:
VITE_API_BASE_URL=http://localhost:3000/api
Update the URL according to your backend server location.

📷 Screenshots
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a9e0478f-0bde-44c8-93d0-53a2874fa4ec" />

📡 Backend Integration
This frontend works with the TrueType backend, which handles:

File storage
Text extraction
Plagiarism analysis
User data

Backend repo: https://github.com/lazyanusha/plagiarismbackend



