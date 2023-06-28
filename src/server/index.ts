import express from "express";
import gracefulShutdown from "http-graceful-shutdown";
import { logger } from "../logger";
import { getFlagsApi } from "./get-flags";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.get("/get-flags", async (req, res) => {
  logger.log("got a call");
  try {
    const flagObj = await getFlagsApi();
    res.send(flagObj);
  } catch (error) {
    res.status(500).send({ error });
  }
  logger.log("done");
});

app.get("/delay", (req, res) => {
  logger.log("got a call");
  setTimeout(() => {
    res.send();
    logger.log("done");
  }, 5 * 1000);
});

const server = app.listen(port, host, () => {
  logger.log(`[ ready ] http://${host}:${port}`);
});

gracefulShutdown(server, {
  onShutdown: (signal) => {
    logger.log("shutting down", signal);
    return Promise.resolve();
  },
});

process.on("SIGTERM", () => {
  logger.log("SIGTERM");
});

process.on("SIGINT", () => {
  logger.log("SIGINT");
});
