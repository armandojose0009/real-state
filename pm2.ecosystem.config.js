module.exports = {
  apps: [
    {
      name: 'real-estate-api',
      script: 'npm',
      args: 'run start:dev',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
