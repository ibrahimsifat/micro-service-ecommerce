import prisma from "@/prisma";
import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { field } = req.query;
    let user: User | null = null;

    if (field === "authUserId") {
      user = await prisma.user.findUnique({
        where: {
          authUserId: id,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
    }

    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export default getUserById;
