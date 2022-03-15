const express = require('express');
const Proxy = require('http-proxy-middleware');

const app = express();

const proxyInstance = Proxy.createProxyMiddleware({
  target: 'https://api.amplitude.com',
  secure: true,
  changeOrigin: true,
  logLevel: 'error',
  onProxyReq: Proxy.fixRequestBody
})

app.all('*', proxyInstance);

module.exports = {
	proxy: app
}