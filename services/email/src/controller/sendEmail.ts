import { defaultSender, transporter } from "@/config";
import prisma from "@/prisma";
import { EmailCreateSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the request body
    const parseBody = EmailCreateSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ error: parseBody.error.errors });
    }

    // create mail option
    const { sender, recipient, subject, body, source } = parseBody.data;
    const from = sender || defaultSender;
    const emailOption = {
      from,
      to: recipient,
      subject,
      text: body,
    };

    // send the email

    const { rejected } = await transporter.sendMail(emailOption);
    if (rejected.length) {
      console.log("email Rejected:", rejected);
      return res.status(500).json({ message: "Failed" });
    }

    await prisma.email.create({
      data: {
        sender: from,
        recipient,
        subject,
        body,
        source,
      },
    });

    return res.status(200).json({ message: "Email sent" });
  } catch (error) {
    next(error);
  }
};

export default sendEmail;
