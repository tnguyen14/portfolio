const httpProxy = require("http-proxy");
const https = require("https");
const url = require("url");
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.robinhoodProxy = (req, res) => {
  const proxy = httpProxy.createProxyServer({
    agent: https.globalAgent,
    headers: {
      host: "api.robinhood.com"
    }
  });

  proxy.web(req, res, { target: "https://api.robinhood.com" });

  // inspired from https://github.com/http-party/node-http-proxy/issues/872#issuecomment-277056284
  const allowedOrigins = ["localhost", "tridnguyen.com"];

  proxy.on("proxyRes", (proxyRes, req, res) => {
    let allowedOrigin = false;
    if (req.headers.origin) {
      const originHostName = new url.URL(req.headers.origin).hostname;
      if (originHostName && allowedOrigins.includes(originHostName)) {
        res.setHeader("access-control-allow-origin", req.headers.origin);
        res.setHeader("access-control-allow-credentials", "true");
        allowedOrigin = true;
      }
    }

    if (req.headers["access-control-request-method"]) {
      res.setHeader(
        "access-control-allow-methods",
        req.headers["access-control-request-method"]
      );
    }

    if (req.headers["access-control-request-headers"]) {
      res.setHeader(
        "access-control-allow-headers",
        req.headers["access-control-request-headers"]
      );
    }

    if (allowedOrigin) {
      res.setHeader("access-control-max-age", 60 * 60 * 24 * 30);
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
      }
    }
  });
};
