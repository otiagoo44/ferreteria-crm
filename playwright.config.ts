import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/ui",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
    },
    {
      command: "npx vite --mode real --host 127.0.0.1 --port 5184 --strictPort",
      url: "http://127.0.0.1:5184",
      reuseExistingServer: false,
      env: {
        VITE_APP_MODE: "real",
        VITE_SUPABASE_URL: "",
        VITE_SUPABASE_ANON_KEY: "",
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } },
    },
  ],
});
