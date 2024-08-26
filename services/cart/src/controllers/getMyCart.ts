import redis from "@/redis";
import { NextFunction, Request, Response } from "express";

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;
    console.log("sdsd");
    if (!cartSessionId) {
      return res.status(200).json({ data: [] });
    }

    const session = await redis.exists(`sessions:${cartSessionId}`);

    if (!session) {
      await redis.del(`cart:${cartSessionId}`);
      return res.status(200).json({ data: [] });
    }

    const items = await redis.hgetall(`cart:${cartSessionId}`);
    if (Object.keys(items).length === 0) {
      return res.status(200).json({ data: [] });
    }

    // format the items
    const formattedItems = Object.keys(items).map((key) => {
      const { quantity, inventoryId } = JSON.parse(items[key]) as {
        quantity: number;
        inventoryId: string;
      };
      return {
        productId: key,
        quantity,
        inventoryId: key,
      };
    });

    res.status(200).json({ items: formattedItems });

    return;
  } catch (error) {
    next(error);
  }
};

export default getMyCart;
