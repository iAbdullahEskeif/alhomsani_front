// main.tsx
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { clerkAppearance } from "./clerk-theme";
import { SessionMonitor } from "./services/clerk/SessionMonitor";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={clerkAppearance}
        afterSignOutUrl="/"
      >
        <QueryClientProvider client={queryClient}>
          <SessionMonitor />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ClerkProvider>
    </StrictMode>,
  );
}
