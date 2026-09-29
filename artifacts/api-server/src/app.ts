import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Cookie-authenticated mutations must never be callable from another origin.
app.use(cors({ origin: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const apiErrorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  req.log.error({ error }, "API request failed");
  if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
};
app.use("/api", apiErrorHandler);

export default app;
