import { CART_TTL, INVENTORY_SERVICE } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schemas";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

const addToCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the request body
    const parseBody = CartItemSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.errors });
    }

    let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    // check if cart session id is present in the request header and exists in the store
    if (cartSessionId) {
      const exists = await redis.exists(`sessions:${cartSessionId}`);
      if (!exists) {
        console.log("Session exists:", exists);
      }
    }

    // if cart session id is not present, create a new one
    if (!cartSessionId) {
      cartSessionId = uuid();
      console.log("New Session ID: ", cartSessionId);

      // set the cart session id in the redis store
      await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId);

      // set the cart session id in the response header
      res.setHeader("x-cart-session-id", cartSessionId);
    }

    // check if the inventory is available
    const { data } = await axios.get(
      `${INVENTORY_SERVICE}/inventories/${req.body.inventoryId}`
    );

    if (parseInt(data.quantity) < parseInt(parseBody.data.inventoryId)) {
      return res.status(400).json({ message: "Inventory not available" });
    }

    // add the item to the cart
    await redis.hset(
      `cart:${cartSessionId}`,
      req.body.productId,
      JSON.stringify({
        inventoryId: req.body.inventoryId,
        quantity: req.body.quantity,
      })
    );

    // update inventories
    await axios.put(
      `${INVENTORY_SERVICE}/inventories/${req.body.inventoryId}`,
      {
        quantity: parseBody.data.quantity,
        actionType: "OUT",
      }
    );

    return res
      .status(201)
      .json({ message: "Item added to cart", cartSessionId });

    // TODO: check inventory for availability
    // TODO: update the inventory
  } catch (error) {
    next(error);
  }
};

export default addToCard;
