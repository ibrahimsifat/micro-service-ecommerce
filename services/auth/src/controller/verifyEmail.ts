import { EMAIL_SERVICE } from "@/config";
import prisma from "@/prisma";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { EmailVerificationSchema } from "../schemas";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request body
    const parseBody = EmailVerificationSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ message: parseBody.error.errors });
    }

    // check user email is not exits
    const user = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // find the verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: parseBody.data.code,
      },
    });
    if (!verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    // if the code has expired
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // update the user status to verified
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
        status: "ACTIVE",
      },
    });

    // update verification code status
    await prisma.verificationCode.update({
      where: {
        id: verificationCode.id,
      },
      data: {
        status: "USED",
        verifiedAt: new Date(),
      },
    });

    // send success email
    await axios.post(`${EMAIL_SERVICE}/emails/send`, {
      recipient: user.email,
      subject: "Email Verified",
      body: "Your email has been verified successfully",
      source: "email-verification",
    });

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    next(error);
  }
};

export default verifyEmail;
