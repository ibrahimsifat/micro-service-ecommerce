import prisma from "@/prisma";
import { InventoryCreateDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // validate request body
  try {
    const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    // create inventory
    const inventory = await prisma.inventory.create({
      data: {
        ...parsedBody.data,
        histories: {
          create: {
            actionType: "IN",
            lastQuantity: 0,
            quantityChanged: parsedBody.data.quantity,
            newQuantity: parsedBody.data.quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    res.status(201).json(inventory);
  } catch (error) {
    next(error);
  }
};

export default createInventory;
