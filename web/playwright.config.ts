import { defineConfig, devices } from '@playwright/test';

// Two dev servers, both pointed at unreachable *.invalid hosts so no test can touch the real backend:
//  - GUEST (5180): VITE_SKIP_AUTH=true, /app opens without sign-in.
//  - AUTH  (5181): sign-in required; the backend is faked per test in tests/e2e/fixtures/mockBackend.ts.
const fake = {
  NEON_AUTH_BASE_URL: 'https://auth.mock.invalid/neon-auth',
  NEON_FUNCTION_API_BASE_URL: 'https://api.mock.invalid',
  NEON_REALTIME_URL: '',
  VITE_GOOGLE_AUTH: 'true',
};

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  retries: 0, // no retries: a flaky test must fail loudly
  workers: 2, // 4 workers overloaded the Vite dev server on this OneDrive path and caused timeouts
  reporter: [['list'], ['json', { outputFile: 'e2e-results/results.json' }], ['html', { outputFolder: 'e2e-results/html', open: 'never' }]],
  outputDir: 'e2e-results/artifacts',
  use: { channel: 'msedge', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'off' },
  projects: [
    { name: 'guest', testMatch: /.*\.guest\.spec\.ts/, use: { ...devices['Desktop Chrome'], channel: 'msedge', baseURL: 'http://localhost:5180' } },
    { name: 'auth', testMatch: /.*\.auth\.spec\.ts/, use: { ...devices['Desktop Chrome'], channel: 'msedge', baseURL: 'http://localhost:5181' } },
    { name: 'phone', testMatch: /.*\.phone\.spec\.ts/, use: { ...devices['Pixel 7'], channel: 'msedge', baseURL: 'http://localhost:5180' } },
  ],
  webServer: [
    { command: 'npx vite --port 5180 --strictPort', port: 5180, reuseExistingServer: false, env: { ...fake, VITE_SKIP_AUTH: 'true' } },
    { command: 'npx vite --port 5181 --strictPort', port: 5181, reuseExistingServer: false, env: { ...fake, VITE_SKIP_AUTH: 'false' } },
  ],
});
