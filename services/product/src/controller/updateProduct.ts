import prisma from "@/prisma";
import { ProductUpdateDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // parse body
    const parseBody = ProductUpdateDTOSchema.safeParse(req.body);
    if (!parseBody.success)
      return res.status(400).json({ errors: parseBody.error.errors });

    // check if the product exits
    const product = await prisma.product.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: parseBody.data,
    });

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export default updateProduct;
