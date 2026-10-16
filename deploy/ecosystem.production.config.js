// PM2 processes for the live site. deploy.sh starts or reloads them after each
// deploy. `cwd` is the `current` symlink, so a reload runs the newest release.
const os = require('node:os');
const path = require('node:path');

const base = process.env.DEPLOY_BASE || path.join(os.homedir(), 'apps', 'albertdammara.com');
const current = path.join(base, 'current');

module.exports = {
  apps: [
    {
      name: 'personal-website',
      cwd: current,
      script: path.join(current, 'node_modules/next/dist/bin/next'),
      // Only nginx talks to the app; it is not reachable from other machines
      args: 'start -p 3000 -H 127.0.0.1',
      env: { NODE_ENV: 'production' },
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
  ],
};
