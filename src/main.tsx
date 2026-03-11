import { createRoot } from "react-dom/client";
import App from "../src/App";
import "./index.css";

// Preconnect to Supabase so the first API call skips DNS + TLS negotiation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
if (supabaseUrl) {
	try {
		const origin = new URL(supabaseUrl).origin;
		const pc = document.createElement("link");
		pc.rel = "preconnect";
		pc.href = origin;
		document.head.appendChild(pc);
	} catch { /* invalid URL — skip silently */ }
}

createRoot(document.getElementById("root")!).render(<App />);
