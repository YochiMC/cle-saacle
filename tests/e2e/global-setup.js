import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export default async function globalSetup() {
    const databasePath = path.join(process.cwd(), 'database', 'e2e.sqlite');

    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    if (!fs.existsSync(databasePath)) {
        fs.writeFileSync(databasePath, '');
    }

    const env = {
        ...process.env,
        APP_ENV: 'local',
        DB_CONNECTION: 'sqlite',
        DB_DATABASE: databasePath,
        SESSION_DRIVER: 'file',
        CACHE_STORE: 'array',
        QUEUE_CONNECTION: 'sync',
        MAIL_MAILER: 'array',
        BROADCAST_CONNECTION: 'null',
    };

    execFileSync(
        'php',
        [
            'artisan',
            'migrate:fresh',
            '--seed',
            '--force',
            '--seeder=E2eTestSeeder',
        ],
        { stdio: 'inherit', env },
    );
}
