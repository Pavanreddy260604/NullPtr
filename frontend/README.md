# NullPtr - Engineering Study Platform

A modern PWA study platform for CS & Engineering students with MCQs, Fill-in-the-Blanks, and Q&A questions.

## 🚀 Features

- **Offline Support** - Works without internet after first load
- **PWA** - Install as native app on mobile/desktop
- **Dark/Light Mode** - Automatic theme switching
- **Multiple Question Types** - MCQs, Fill Blanks, Descriptive Q&A
- **Subject-based Organization** - Units and topics

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **State**: React Query
- **Backend**: Node.js + Express + MongoDB
- **Hosting**: Vercel (frontend) + Render (backend)

## 📦 Setup

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repo
git clone https://github.com/Pavanreddy260604/study.git

# Navigate to study folder
cd study

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=https://study-g3xc.onrender.com" > .env

# Start dev server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
study/
├── public/           # Static assets (icons, manifest)
├── src/
│   ├── components/   # UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities and API
│   ├── pages/        # Page components
│   └── App.tsx       # Root component
├── index.html
├── vite.config.ts    # Vite + PWA config
└── tailwind.config.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Open source - feel free to use and modify!

## 👨‍💻 Author

**Pavan Reddy** - [GitHub](https://github.com/Pavanreddy260604)
