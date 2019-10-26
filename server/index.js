const axios = require("axios");
const express = require("express");
const winston = require("winston");
const expressWinston = require("express-winston");
const flatCache = require("flat-cache");
const path = require("path");
const url = require("url");
const queryString = require("querystring");

const cache = flatCache.load("cacheId", path.resolve("./.cache"));

const app = express();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({
      filename: ".logs/error.log",
      level: "error"
    }),
    new winston.transports.File({ filename: ".logs/combined.log" })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

process.on("unhandledRejection", ex => {
  throw ex;
});

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    expressFormat: true
  })
);

app.use("/", async (req, res) => {
  const data = cache.getKey("london2");
  res.status(200).send(data);
});

const server = app.listen(3000, () =>
  logger.info("Server is listening on port 3000...")
);

const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;
const wss = new WebSocketServer({
  server: server,
  path: "/ws",
  clientTracking: true
});

wss.on("connection", (ws, req) => {
  console.log(
    "connected",
    // url.parse(req.url).query,
    queryString.parse(url.parse(req.url).query).city
  );
  console.log(req);

  ws.on("message", msg => {
    console.log(`received: ${msg}`);
  });

  // setInterval(() => {
  //   ws.send("something");
  // }, 3000);
});

setInterval(async () => {
  const { data } = await axios.get(
    // "http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=e10e37cd1ba097b5d1d60da187c098ca"
    "http://localhost:3001"
  );

  cache.setKey("london2", data);
  cache.save(true);

  // Broadcast to all.
  console.log(wss.clients.size);
  wss.clients.forEach(client => {
    console.log(Object.keys(client));
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}, 5000);
