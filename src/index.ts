import express = require('express');
import bodyParser = require('body-parser');
import * as http from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fixRequestBody } from 'http-proxy-middleware';
import { requestToEvents } from './event';
import { Environment } from './config';

const app = express();

const targetUrl = process.env.TARGET_URL;
if (!targetUrl) {
  throw new Error("No TARGET_URL set");
}

const environment = process.env.ENVIRONMENT as Environment;
console.log(`Environment set to: ${environment}`);

const proxyInstance = createProxyMiddleware({
  target: targetUrl,
  secure: true,
  changeOrigin: true,
  logLevel: "error",
  onProxyReq: (proxyReq, req) => {
    fixRequestBody(proxyReq, req as http.IncomingMessage);
  }
});

app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(requestToEvents(environment))
  .all('*', proxyInstance)

module.exports = {
	proxy: app
}