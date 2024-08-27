// validate user input
// Get cart items using cartSessionId
// If cart is empty return 400 error
// Find all product details by the product id from carts
// create order and order items
// invoke email service
// invoke cart service

import { CART_SERVICE, EMAIL_SERVICE, PRODUCT_SERVICE } from "@/config";
import prisma from "@/prisma";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { CartItemSchema, OrderSchema } from "../schemas";

const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request
    const parsedBody = OrderSchema.safeParse(req.body);
    if (!parsedBody.success)
      return res.status(400).json(parsedBody.error.errors);

    // get cart details
    const { data: cartData } = await axios.get(`${CART_SERVICE}/cart/me`, {
      headers: {
        "x-session-id": parsedBody.data.cartSessionId,
      },
    });

    const cartItems = z.array(CartItemSchema).safeParse(cartData.items);

    if (!cartItems.success) return res.status(400).json(cartItems.error.errors);

    if (cartItems.data.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // get product details from cart items
    const productDetails = await Promise.all(
      cartItems.data.map(async (item) => {
        const { data: product } = await axios.get(
          `${PRODUCT_SERVICE}/product/${item.productId}`
        );
        return {
          productId: product.id as string,
          productName: product.name as string,
          price: product.price as number,
          sku: product.sku as string,
          quantity: item.quantity as number,
          total: (product.price * item.quantity) as number,
        };
      })
    );

    const subtotal = productDetails.reduce((acc, item) => acc + item.total, 0);

    // TODO: will handle tax calculation later
    const tax = 0;
    const grandTotal = subtotal + tax;

    // create order
    const order = await prisma.order.create({
      data: {
        userId: parsedBody.data.userId,
        userName: parsedBody.data.userName,
        userEmail: parsedBody.data.userEmail,
        subtotal,
        tax,
        grandTotal,
        orderItems: {
          create: productDetails.map((item) => ({
            ...item,
          })),
        },
      },
    });

    // clear cart
    await axios.get(`${CART_SERVICE}/cart/clear`, {
      headers: {
        "x-session-id": parsedBody.data.cartSessionId,
      },
    });

    // send Email
    await axios.post(`${EMAIL_SERVICE}/emails/send`, {
      recipient: parsedBody.data.userEmail,
      subject: "Order Confirmation",
      body: `Thank you for your order! Your Order Id is ${order.id}. Your order total is $${grandTotal}.`,
      source: "Checkout",
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export default checkout;
