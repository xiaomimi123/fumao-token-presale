import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initAppKit } from './wallet/appkit';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

// 初始化 Reown AppKit（WalletConnect 多钱包聚合，默认 BSC 主网）
initAppKit();

createRoot(rootElement).render(<App />);
