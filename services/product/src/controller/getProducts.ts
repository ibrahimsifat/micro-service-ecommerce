import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        inventoryId: true,
      },
    });

    //  TODO: Implement Pagination
    // TODO: Implement Filtering
    res.json({ data: products });
  } catch (error) {
    next(error);
  }
};

export default getProducts;
