import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/common/theme-provider.tsx"

import App from "./App.tsx"
import "./index.css"

const container = document.getElementById("root")
if (!container) throw new Error("Could not find root element")

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
