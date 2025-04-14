/* eslint-disable */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy pentru serverul local
  app.use(
    '/api',  // Cererile care încep cu /api
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );

  // Proxy pentru API-ul Tiingo
  app.use(
    '/tiingo',  // Cererile care încep cu /tiingo
    createProxyMiddleware({
      target: 'https://api.tiingo.com',
      changeOrigin: true,
      pathRewrite: {
        '^/tiingo': '', // Elimină '/tiingo' din cale înainte de a trimite la Tiingo
      },
    })
  );
  app.use(
    '/iex',  // Interceptează cererile care încep cu /iex
    createProxyMiddleware({
      target: 'https://api.tiingo.com',
      changeOrigin: true,
      // Nu mai avem nevoie de pathRewrite în acest caz
    })
  );
};
/* eslint-enable */