import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSecurityProtections } from "./lib/security";

// Initialize security protections (blocks APK downloads, malicious URLs, etc.)
initSecurityProtections();

createRoot(document.getElementById("root")!).render(<App />);
