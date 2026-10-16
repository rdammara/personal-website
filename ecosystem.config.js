// PM2 process for the development preview: this checkout, on port 3001, with its
// own database (prisma/dev.db). Reachable over Tailscale only, since the firewall
// does not open 3001. The live site uses deploy/ecosystem.production.config.js.
//   npm run build && pm2 startOrReload ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'personal-website-dev',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      time: true,
    },
  ],
};
