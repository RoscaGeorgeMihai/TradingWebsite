/* eslint-disable */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy pentru serverul local (backend)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error' });
      }
    })
  );

  // Proxy pentru Marketstack API
  app.use(
    '/marketstack',
    createProxyMiddleware({
      target: 'http://api.marketstack.com/v2',
      changeOrigin: true,
      pathRewrite: {
        '^/marketstack': '',
      },
      onProxyReq: (proxyReq) => {
        proxyReq.path += `${proxyReq.path.includes('?') ? '&' : '?'}access_key=809465cd231141db8a09832ee9946255`;
      },
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
  );
};
/* eslint-enable */