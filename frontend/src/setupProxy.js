// Instructs the react app scripts to redirect requests to /api to localhost:3000/
// where our backend server will be running

// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const fs = require('fs');

// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const { createProxyMiddleware } = require('http-proxy-middleware');

// eslint-disable-next-line no-undef
const { SSL_CRT_FILE, SSL_KEY_FILE } = process.env;

// eslint-disable-next-line no-undef
module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' }, // remove /api url prefix when redirecting to backend
    })
  );
};
