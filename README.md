<p align="center">
  <img src="frontend/public/android-chrome-192x192.png" alt="NullPtr Logo" width="120" height="120">
</p>

<h1 align="center">NullPtr</h1>

<p align="center">
  <strong>The Ultimate Study Platform for CS & Engineering Students</strong>
</p>

<p align="center">
  <a href="https://a5f5210e.study-8xz.pages.dev/subjects/694141ae7cd65c429ef643ae">🌐 Live Demo</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-installation">🚀 Installation</a> •
  <a href="#-tech-stack">🛠️ Tech Stack</a> •
  <a href="#-contributing">🤝 Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-8.1-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

**NullPtr** is a comprehensive, modern study platform specifically designed for Computer Science and Engineering students. Built with a focus on offline functionality and user experience, NullPtr provides an engaging way to practice and master engineering subjects through interactive quizzes and Q&A sessions.

Whether you're preparing for exams, revising concepts, or testing your knowledge, NullPtr offers a seamless learning experience that works anywhere — even without an internet connection.

### What Makes NullPtr Special?

- 📱 **Progressive Web App (PWA)** - Install on any device and use offline
- 🎨 **Terminal-Inspired Design** - CS-freak aesthetic with sleek animations
- 📚 **Multiple Question Types** - MCQs, Fill-in-the-Blanks, and Descriptive Q&A
- 🌙 **Dark/Light Mode** - Automatic theme switching based on system preference
- ⚡ **Lightning Fast** - Optimized performance with edge deployment

---

## 🌐 Live Demo

Experience NullPtr in action:

**👉 [https://a5f5210e.study-8xz.pages.dev/subjects/694141ae7cd65c429ef643ae](https://a5f5210e.study-8xz.pages.dev/subjects/694141ae7cd65c429ef643ae)**

Try out the platform, explore subjects, and practice questions — all in your browser!

---

## ✨ Features

### 📖 Learning Features

| Feature | Description |
|---------|-------------|
| **Multiple Choice Questions (MCQs)** | Interactive MCQs with instant feedback and explanations |
| **Fill in the Blanks** | Test recall with gap-filling exercises |
| **Descriptive Q&A** | Detailed questions with rich text and image support |
| **Subject Organization** | Content organized by subjects, units, and topics |
| **Progress Tracking** | Track your learning progress across subjects |

### 🔧 Technical Features

| Feature | Description |
|---------|-------------|
| **Offline Support** | Full PWA functionality - works without internet |
| **Installable App** | Add to home screen on mobile/desktop |
| **Real-time Updates** | Data syncs automatically when online |
| **Responsive Design** | Perfect experience on any screen size |
| **Theme Support** | Dark and light mode with smooth transitions |

### 👨‍💼 Admin Features

| Feature | Description |
|---------|-------------|
| **Subject Management** | Create, update, and delete subjects |
| **Question Editor** | Rich text editor for creating questions |
| **Bulk Import** | Import multiple questions at once |
| **Image Support** | Upload and manage images via Cloudinary |
| **Dashboard** | Overview of all content and statistics |

---

## 🏗️ Project Architecture

```
NullPtr/
├── frontend/                 # Student-facing React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── MCQCard.tsx   # MCQ question component
│   │   │   ├── FillBlankCard.tsx
│   │   │   └── DescriptiveCard.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Index.tsx     # Home page
│   │   │   ├── SubjectPage.tsx
│   │   │   └── UnitPage.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and API clients
│   ├── public/               # Static assets (icons, manifest)
│   └── vite.config.ts        # Vite + PWA configuration
│
├── admin/                    # Admin panel React application
│   ├── src/
│   │   ├── components/       # Admin UI components
│   │   ├── pages/            # Admin pages
│   │   └── lib/              # Admin utilities
│   └── vite.config.ts
│
├── backend/                  # Node.js + Express API server
│   ├── src_temp/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   └── config/           # Database configuration
│   ├── cloudfare/            # Cloudflare Worker (cron jobs)
│   └── server.js             # Express server entry
│
└── ServerlessForNonAdmin/    # Serverless API for public access
    └── api/
        └── index.js
```

---

## 🛠️ Tech Stack

### Frontend (Student & Admin)

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool and dev server |
| **TailwindCSS** | Utility-first styling |
| **shadcn/ui** | Beautiful, accessible components |
| **React Query** | Server state management |
| **React Router** | Client-side routing |
| **Lucide React** | Modern icon library |
| **vite-plugin-pwa** | PWA functionality |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **Cloudinary** | Image hosting and CDN |
| **Multer** | File upload handling |

### DevOps & Hosting

| Service | Purpose |
|---------|---------|
| **Cloudflare Pages** | Frontend hosting (CDN + edge) |
| **Render** | Backend API hosting |
| **Cloudflare Workers** | Serverless cron jobs |
| **MongoDB Atlas** | Cloud database |
| **Cloudinary** | Image CDN |

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **bun** package manager
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account ([Sign up](https://cloudinary.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Pavanreddy260604/NullPtr.git

# Navigate to the project directory
cd NullPtr
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=https://study-g3xc.onrender.com" > .env

# Start development server
npm run dev

# Frontend available at http://localhost:5173
```

### Admin Panel Setup

```bash
# Navigate to admin
cd admin

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=https://study-g3xc.onrender.com" > .env

# Start development server
npm run dev

# Admin panel available at http://localhost:5174
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb+srv://your-connection-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EOF

# Start development server
npm run dev

# API available at http://localhost:3000
```

---

## 💻 Usage

### For Students

1. **Browse Subjects** - View available subjects on the home page
2. **Select a Unit** - Choose a unit within a subject
3. **Practice Questions** - Answer MCQs, fill-in-blanks, or review descriptive Q&A
4. **Track Progress** - Monitor your learning journey

### For Admins

1. **Access Admin Panel** - Navigate to the admin URL
2. **Manage Subjects** - Create, edit, or delete subjects
3. **Add Questions** - Use the rich editor to create questions
4. **Upload Images** - Add supporting images to questions
5. **Bulk Import** - Import multiple questions via JSON

---

## 📡 API Reference

### Base URL
```
Production: https://study-g3xc.onrender.com
Development: http://localhost:3000
```

### Endpoints

#### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subjects` | List all subjects |
| `GET` | `/api/subjects/:id` | Get subject by ID |
| `POST` | `/api/subjects` | Create a subject |
| `PUT` | `/api/subjects/:id` | Update a subject |
| `DELETE` | `/api/subjects/:id` | Delete a subject |

#### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/questions/:subjectId` | Get questions by subject |
| `POST` | `/api/questions/mcq` | Create MCQ |
| `POST` | `/api/questions/fill-blanks` | Create fill-in-blank |
| `POST` | `/api/questions/descriptive` | Create descriptive Q&A |

#### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health status |

---

## 🚢 Deployment

### Frontend (Cloudflare Pages)

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
3. Set environment variable: `VITE_API_URL`
4. Deploy! 🎉

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables (MongoDB, Cloudinary)
3. Deploy as a Web Service
4. Note: Free tier sleeps after 15 minutes of inactivity

### Cloudflare Worker (Cron Job)

The project includes a Cloudflare Worker that pings the backend every 5 minutes to keep it awake:

```bash
cd backend/cloudfare

# Login to Cloudflare
wrangler login

# Deploy the worker
wrangler deploy
```

---

## 📚 Documentation

Detailed documentation is available in the `frontend/` directory:

| Document | Description |
|----------|-------------|
| [PWA-GUIDE.md](frontend/PWA-GUIDE.md) | Complete PWA setup and configuration guide |
| [CLOUDFLARE-GUIDE.md](frontend/CLOUDFLARE-GUIDE.md) | Cloudflare Workers, Pages, and KV documentation |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository** - Click the fork button on GitHub
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/NullPtr.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```
4. **Make your changes** - Implement your feature or fix
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-amazing-feature
   ```
7. **Open a Pull Request** - Describe your changes and submit for review

### Code Style Guidelines

- ✅ Follow existing code patterns and conventions
- ✅ Use TypeScript for type safety
- ✅ Write clear, descriptive commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
- ✅ Add tests for new functionality where applicable
- ✅ Update documentation as needed
- ✅ Ensure all linters pass (`npm run lint`)

### Commit Message Format

```
feat: add new quiz timer feature
fix: resolve issue with answer validation
docs: update API documentation
style: format code with prettier
refactor: simplify question fetching logic
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Pavanreddy260604

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Contact

<p align="center">
  <a href="https://github.com/Pavanreddy260604">
    <img src="https://img.shields.io/badge/GitHub-Pavanreddy260604-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

- **Author**: [Pavanreddy260604](https://github.com/Pavanreddy260604)
- **Repository**: [NullPtr](https://github.com/Pavanreddy260604/NullPtr)
- **Issues**: [GitHub Issues](https://github.com/Pavanreddy260604/NullPtr/issues)

---

## ⭐ Show Your Support

If you find NullPtr helpful, please consider giving it a star on GitHub! ⭐

Your support encourages continued development and maintenance of this project.

---

<p align="center">
  <strong>Built with ❤️ for CS & Engineering Students</strong>
</p>

<p align="center">
  <em>Last Updated: December 18, 2025</em>
</p>

<p align="center">
  <a href="https://github.com/Pavanreddy260604/NullPtr">
    <img src="https://img.shields.io/badge/View_Source_Code-GitHub-181717?style=for-the-badge&logo=github" alt="Source Code">
  </a>
</p>
