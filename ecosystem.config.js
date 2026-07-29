module.exports = {
  apps: [
    {
      name: "affiliate-hoantien",
      script: "npm",
      args: "start -- -p 4500",
      cwd: "/var/www/affiliate-hoantien",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
