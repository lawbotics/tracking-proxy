const express = require('express');
const Proxy = require('http-proxy-middleware');

const app = express();

const proxyInstance = Proxy.createProxyMiddleware({
  target: process.env.TARGET_URL,
  secure: true,
  changeOrigin: true,
  logLevel: 'error',
  onProxyReq: Proxy.fixRequestBody
})

app.all('*', proxyInstance);

module.exports = {
	proxy: app
}