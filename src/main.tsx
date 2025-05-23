import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "@/components/theme-provider"
import { RootLayout } from "@/components/layout/root-layout"
import "./App.css";

// Create a hash history instance
const hashHistory = createHashHistory()

// Create a new router instance with hash history
const router = createRouter({ 
  routeTree,
  history: hashHistory
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="plannr-theme">
      <RootLayout>
        <RouterProvider router={router} />
      </RootLayout>
    </ThemeProvider>
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
