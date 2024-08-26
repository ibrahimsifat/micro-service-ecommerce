import { INVENTORY_SERVICE } from "@/config";
import redis from "@/redis";
import axios from "axios";

export const clearCart = async (id: string) => {
  try {
    const data = await redis.hgetall(`cart:${id}`);
    if (Object.keys(data).length === 0) {
      return;
    }

    const items = Object.keys(data).map((key) => {
      const { quantity, inventoryId } = JSON.parse(data[key]) as {
        quantity: number;
        inventoryId: string;
      };
      return {
        productId: key,
        quantity,
        inventoryId,
      };
    });

    // update inventory NOTE: this is not efficient way to bulk update product inventory
    // TODO: write single request for bulk inventory update

    const requests = items.map(async (item) => {
      return await axios.put(
        `${INVENTORY_SERVICE}/inventories/${item.inventoryId}`,
        {
          quantity: item.quantity,
          actionType: "IN",
        }
      );
    });

    Promise.all(requests);
    console.log("Inventory Updated");

    // clear the cart
    await redis.del(`cart:${id}`);
    console.log("Cart Cleared");
  } catch (error) {
    console.log(error);
  }
};
