import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "prisma";
import { AccessTokenSchema } from "../schemas";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request body
    const parseBody = AccessTokenSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ message: parseBody.error.errors });
    }

    const { accessToken } = parseBody.data;

    const decoded = jwt.verify(
      accessToken,
      (process.env.JWT_SECRET as string) || "my_secret_key"
    );
    const user = await prisma.user.findUnique({
      where: {
        id: (decoded as any).userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ message: "Authorized", user });
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
