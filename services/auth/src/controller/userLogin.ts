import { LoginAttempt } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "prisma";
import { UserLoginSchema } from "../schemas";

type LoginHistory = {
  userId: string;
  userAgent: string | undefined;
  ipAddress: string | undefined;
  attempt: LoginAttempt;
};

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: info.userId,
      userAgent: info.userAgent,
      ipAddress: info.ipAddress,
      attempt: info.attempt,
    },
  });
};

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get user ip address and user agent
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "";
    const userAgent = req.headers["user-agent"] || "";

    // validate the request body
    const parseBody = UserLoginSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ message: parseBody.error.errors });
    }

    // check if the user exist
    const user = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!user) {
      await createLoginHistory({
        userId: "Guest",
        userAgent,
        ipAddress,
        attempt: "FAILED",
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatched = await bcrypt.compare(
      parseBody.data.password,
      user.password
    );
    if (!isMatched) {
      await createLoginHistory({
        userId: user?.id,
        userAgent,
        ipAddress,
        attempt: "FAILED",
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check if verified user
    if (!user.verified) {
      await createLoginHistory({
        userId: user?.id,
        userAgent,
        ipAddress,
        attempt: "FAILED",
      });
      return res.status(400).json({ message: "User is not Verified" });
    }

    // check if the account is active
    if (user.status !== "ACTIVE") {
      await createLoginHistory({
        userId: user?.id,
        userAgent,
        ipAddress,
        attempt: "FAILED",
      });
      return res.status(400).json({
        message: `Your Account is ${user.status?.toLocaleLowerCase()} `,
      });
    }

    // generate token

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      (process.env.JWT_SECRET as string) || "my_secret_key",
      { expiresIn: "2h" }
    );

    await createLoginHistory({
      userId: user?.id,
      userAgent,
      ipAddress,
      attempt: "SUCCESS",
    });
    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export default userLogin;
