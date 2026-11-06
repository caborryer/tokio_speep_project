import { defineConfig, devices } from "@playwright/test";

const PORT = 3111;

// Ejecutar: pnpm test:e2e   (UI interactiva: pnpm test:e2e:ui)
// Primera vez en tu Mac: pnpm exec playwright install chromium
export default defineConfig({
  testDir: "./e2e",
  timeout: 70_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Modo prelanzamiento + dev: ranking en memoria (sin Redis) y parámetros ?dbg / ?god habilitados.
    command: `NEXT_PUBLIC_PRELAUNCH=true pnpm exec next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
