import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

export const USER_SERVICE = process.env.USER_SERVICE || "http://localhost:4004";
export const EMAIL_SERVICE =
  process.env.EMAIL_SERVICE || "http://localhost:4005";
export const PRODUCT_SERVICE =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:4001";
export const CART_SERVICE =
  process.env.CART_SERVICE_URL || "http://localhost:4006";
export const QUEUE_URL = process.env.QUEUE_URL || "amqp://localhost";
