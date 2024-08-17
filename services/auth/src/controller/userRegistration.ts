import axios from "axios";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import prisma from "prisma";
import { USER_SERVICE } from "../config";
import { UserCreateSchema } from "../schemas";

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate the request body
    const parsedBody = UserCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ message: parsedBody.error.errors });
    }

    // check if user is already exits
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    // hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

    // create the auth user
    const user = await prisma.user.create({
      data: {
        ...parsedBody.data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        verified: true,
        createAt: true,
        updatedAt: true,
      },
    });
    console.log("user Created", user);

    // create the user profile by calling the user service
    await axios.post(`${USER_SERVICE}/users`, {
      authUserId: user.id,
      email: user.email,
      name: user.name,
    });

    // TODO: generate verification code
    // TODO: send verification email

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
