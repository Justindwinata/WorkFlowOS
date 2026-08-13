{
  "$schema": "https://playwright.dev/schema.json",
  "testDir": "./src/e2e",
  "testFilePattern": "*.test.ts",
  "use": {
    "baseURL": "http://localhost:3000",
    "screenshot": "only-on-failure",
    "video": "retain-on-failure"
  },
  "webServer": {
    "command": "npm run dev",
    "port": 3000,
    "reuseExistingServer": false
  }
}
