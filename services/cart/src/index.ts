import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { addToCard, clearCart, getMyCart } from "./controllers";
import "./events/onKeyExpires";
import "./receiver";
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
app.post("/cart/add-to-cart", addToCard);
app.get("/cart/me", getMyCart);
app.get("/cart/clear", clearCart);

// health check
app.get("/health", (req, res) => {
  res.json({ message: "Cart service UP" });
});
// configure route

// 404 error handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 4006;

const serviceName = process.env.SERVICE_NAME || "Cart-Service";

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
