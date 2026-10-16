// PM2 process definition. Start with `pm2 start ecosystem.config.js`,
// then `pm2 save` so it comes back after a reboot.
module.exports = {
  apps: [
    {
      name: 'personal-website',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      time: true,
    },
  ],
};
