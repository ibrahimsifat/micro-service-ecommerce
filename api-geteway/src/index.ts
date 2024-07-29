import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { configureRoutes } from "./utils";

dotenv.config;

const app = express();

// security middleware
app.use(helmet());

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).send("Too many requests, please try again later.");
  },
});

app.use("/api", limiter);

// request logger
app.use(morgan("dev"));
app.use(express.json());

// routes
app.get("/health", (req, res) => {
  res.json({ message: "API GateWay UP" });
});
// configure route
configureRoutes(app);
// app.get("/api/products", (req, res) => {
//   res.json({ message: "API GateWay UP" });
// });

// TODO: Auth Middleware

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Api Gateway is running on port ${PORT}`);
});
