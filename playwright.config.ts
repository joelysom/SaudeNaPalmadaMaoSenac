import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const production = process.env.TEST_PRODUCTION === '1'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 45_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: `npm run ${production ? 'preview' : 'dev'} -- --host 127.0.0.1 --port 4173 --strictPort`,
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
})
