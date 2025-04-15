// API Configuration
export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://alhomsanibackend-production.up.railway.app";
export const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";

// Feature Flags
export const ENABLE_DEBUG = import.meta.env.VITE_ENABLE_DEBUG === "true";
export const ENABLE_ANALYTICS =
  import.meta.env.VITE_ENABLE_ANALYTICS === "true";
export const ENABLE_WEBSOCKET =
  import.meta.env.VITE_ENABLE_WEBSOCKET === "true";
export const ENABLE_PWA = import.meta.env.VITE_ENABLE_PWA === "true";

// Application Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Store App";
export const APP_DESCRIPTION =
  import.meta.env.VITE_APP_DESCRIPTION || "Your one-stop shop for everything";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

// Authentication Configuration
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED !== "false";
export const AUTH_STORAGE_KEY =
  import.meta.env.VITE_AUTH_STORAGE_KEY || "store_auth_token";

// Performance Configuration
export const ENABLE_LAZY_LOADING =
  import.meta.env.VITE_ENABLE_LAZY_LOADING !== "false";
export const ENABLE_CODE_SPLITTING =
  import.meta.env.VITE_ENABLE_CODE_SPLITTING !== "false";

// Cache Configuration
export const CACHE_DURATION = parseInt(
  import.meta.env.VITE_CACHE_DURATION || "3600",
  10,
);
export const ENABLE_OFFLINE_MODE =
  import.meta.env.VITE_ENABLE_OFFLINE_MODE === "true";

// Error Tracking
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || "";
export const ERROR_REPORTING_ENABLED =
  import.meta.env.VITE_ERROR_REPORTING_ENABLED === "true";
