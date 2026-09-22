import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { runBootResetOnce } from "./lib/boot-reset";

// Demo: reset runtime in-progress / phase state on every full page load.
runBootResetOnce();

createRoot(document.getElementById("root")!).render(<App />);
