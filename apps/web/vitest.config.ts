{
  "test": {
    "globals": true,
    "environment": "jsdom",
    "setupFiles": "./src/test/setup.ts",
    "include": ["**/*.test.{ts,tsx}"],
    "exclude": ["**/*.e2e.{ts,tsx}"]
  },
  "coverage": {
    "provider": "v8",
    "reporter": ["text", "json", "html"],
    "include": ["src/**"],
    "exclude": ["src/test/**", "src/**/*.stories.*"]
  }
}
