import express from "express";
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

app.listen(port, host, () => {
  logger.log(`[ ready ] http://${host}:${port}`);
});
