import { INVENTORY_URL } from "@/config";
import prisma from "@/prisma";
import { ProductCreateDTOSchema } from "@/schemas";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = ProductCreateDTOSchema.safeParse(req.body);
    if (!parsedBody.success)
      return res.status(400).json({ error: parsedBody.error.issues });

    // check if product with them same sku already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: parsedBody.data.sku,
      },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ error: "Product with same sku already exists" });
    }
    // create product
    const product = await prisma.product.create({
      data: parsedBody.data,
    });
    console.log("product created successfully", product.id);

    // create inventory record for the product
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );

    console.log("inventory created successfully", inventory.id);

    // update product and store inventory id
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        inventoryId: inventory.id,
      },
    });

    console.log(
      "product and inventory created successfully with inventory id",
      inventory.id
    );

    res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (err) {
    next(err);
  }
};

export default createProduct;
