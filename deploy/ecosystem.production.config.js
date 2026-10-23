// PM2 processes for the live site. deploy.sh starts or reloads them after each
// deploy. Paths go through the `current` symlink, so a reload runs the newest release.
const os = require('node:os');
const path = require('node:path');

const base = process.env.DEPLOY_BASE || path.join(os.homedir(), 'apps', 'albertdammara.com');
// The standalone build (see next.config.ts): server.js, the sync scripts, and links to
// shared/.env and shared/storage
const current = path.join(base, 'current', '.next', 'standalone');

module.exports = {
  apps: [
    {
      name: 'personal-website',
      cwd: current,
      script: path.join(current, 'server.js'),
      // Only nginx talks to the app; it is not reachable from other machines
      env: { NODE_ENV: 'production', PORT: '3000', HOSTNAME: '127.0.0.1' },
      max_memory_restart: '512M',
      time: true,
    },
    {
      // Runs once, exits, and PM2 starts it again every 15 minutes
      name: 'notion-sync',
      cwd: current,
      script: path.join(current, 'scripts/sync-notion.mjs'),
      node_args: '--env-file=.env',
      cron_restart: '*/15 * * * *',
      autorestart: false,
      time: true,
    },
    {
      // Hourly at :07, so it never starts alongside the Notion sync
      name: 'github-sync',
      cwd: current,
      script: path.join(current, 'scripts/sync-github.mjs'),
      node_args: '--env-file=.env',
      cron_restart: '7 * * * *',
      autorestart: false,
      time: true,
    },
  ],
};
