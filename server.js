'use strict';

const express = require('express');
const NodeCache = require('node-cache');

const cache = new NodeCache();
const { createProxyMiddleware } = require('http-proxy-middleware');

const cacheSet = (key) => {
  const data = cache.get(key);
  if (!data) cache.set(key, 1);
  else cache.set(key, data + 1);
};
const requestMiddleware = (req, res, next) => {
  if (req.url === '/stats') return next();
  cacheSet('REQUEST_COUNT');
  return next();
};

const responseMiddleware = (req, res, next) => {
  if (req.url === '/stats') return next();

  if (res.statusCode < 400) cacheSet('SUCCESS_COUNT');
  else cacheSet('ERROR_COUNT');
  return next();
};

const init = (port = 8080, proxies = [], defaultRes) => {
  const app = express();

  app.use(requestMiddleware);
  app.use(responseMiddleware);

  if (proxies.length > 0)
    proxies.map((proxy) => {
      app.use(
        [`${proxy.route}/**`],
        createProxyMiddleware({
          target: proxy.target,
          pathRewrite: {
            [`^${proxy.route}`]: '',
          },
          changeOrigin: true,
        })
      );
      return proxy;
    });

  app.get('/stats', (req, res) => {
    return res.status(200).json({
      requests: {
        success: cache.get('SUCCESS_COUNT') || 0,
        error: cache.get('ERROR_COUNT') || 0,
        total: cache.get('REQUEST_COUNT') || 0,
      },
    });
  });

  app.get('/api', (req, res) => res.status(200).json({ messages: 'done' }));
  app.use((req, res) => {
    return res.status(defaultRes.status).json({ message: `${defaultRes.message}🥵` });
  });

  process.on('SIGTERM', () => {
    app.close(() => {
      cache.flushAll();
      console.log('Process terminated');
    });
  });

  app.listen(port);
};

module.exports = {
  init,
};
