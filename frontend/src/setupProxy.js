/* eslint-disable */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy pentru serverul local (backend)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );

  // Proxy pentru Marketstack API
  app.use(
    '/marketstack',  // Toate cererile care încep cu /marketstack
    createProxyMiddleware({
      target: 'http://api.marketstack.com/v1',
      changeOrigin: true,
      pathRewrite: {
        '^/marketstack': '', // Elimină prefixul /marketstack din URL
      },
      onProxyReq: (proxyReq) => {
        // Adaugă cheia API la toate cererile către Marketstack
        proxyReq.path += `${proxyReq.path.includes('?') ? '&' : '?'}access_key=7061353b999b62191f389d3f89e618e6`;
      },
      headers: {
        // Poți adăuga headere suplimentare dacă este necesar
        'Cache-Control': 'no-cache',
      },
    })
  );
};
/* eslint-enable */