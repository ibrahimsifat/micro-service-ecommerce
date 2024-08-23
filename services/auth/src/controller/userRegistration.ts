import axios from "axios";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import prisma from "prisma";
import { EMAIL_SERVICE, USER_SERVICE } from "../config";
import { UserCreateSchema } from "../schemas";

const generateVerificationCode = () => {
  const timestamp = new Date().getTime().toString();
  const randomNum = Math.floor(10 + Math.random() * 90);
  let code = (timestamp + randomNum).slice(-5);
  return code;
};

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

    //  generate verification code
    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // send verification email
    await axios.post(`${EMAIL_SERVICE}/emails/send`, {
      recipient: user.email,
      subject: "Email Verification",
      body: `Your verification code is ${code}`,
      source: "user-registration",
    });

    return res.status(201).json({
      message: "Check your email. User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
