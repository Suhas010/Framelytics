import "framer-plugin/framer.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./components/core/App"
import "./App.css"
import { AnalysisProvider } from "./context/AnalysisContext"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <AnalysisProvider>
            <App />
        </AnalysisProvider>
    </React.StrictMode>
)
