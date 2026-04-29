import { defineConfig } from '@playwright/test';
import path from 'node:path';

const baseURL = 'http://127.0.0.1:8000';
const databasePath = path.join(process.cwd(), 'database', 'e2e.sqlite');

const e2eEnv = {
    APP_ENV: 'local',
    APP_URL: baseURL,
    DB_CONNECTION: 'sqlite',
    DB_DATABASE: databasePath,
    SESSION_DRIVER: 'file',
    CACHE_STORE: 'array',
    QUEUE_CONNECTION: 'sync',
    MAIL_MAILER: 'array',
    BROADCAST_CONNECTION: 'null',
};

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    workers: 1,
    retries: 2,
    reporter: 'list',
    timeout: 30000,
    expect: {
        timeout: 5000,
    },
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run dev:e2e',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: e2eEnv,
    },
});
