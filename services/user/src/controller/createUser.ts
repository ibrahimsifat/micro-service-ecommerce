import prisma from "@/prisma";
import { UserCreateSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the request body
    const parseBody = UserCreateSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({ message: parseBody.error.errors });
    }

    // check if the authUserId already exist
    const existingUser = await prisma.user.findUnique({
      where: {
        authUserId: parseBody.data.authUserId,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    // create the user
    const user = await prisma.user.create({
      data: parseBody.data,
    });

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default createUser;
