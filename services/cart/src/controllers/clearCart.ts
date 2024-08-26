import redis from "@/redis";
import { NextFunction, Request, Response } from "express";

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

  if (!cartSessionId) {
    return res.status(200).json({ message: "cart is empty" });
  }

  // check if the session id exist in the store
  const exits = await redis.exists(`sessions:${cartSessionId}`);
  if (!exits) {
    delete req.headers["x-cart-session-id"];
    return res.status(200).json({ message: "Cart is empty" });
  }

  await redis.del(`sessions:${cartSessionId}`);
  await redis.del(`cart:${cartSessionId}`);

  delete req.headers["x-cart-session-id"];

  res.status(200).json({ message: "cart cleared" });
};

export default clearCart;
