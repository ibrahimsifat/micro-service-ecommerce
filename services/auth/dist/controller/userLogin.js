"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const schemas_1 = require("../schemas");
const createLoginHistory = async (info) => {
    await prisma_1.default.loginHistory.create({
        data: {
            userId: info.userId,
            userAgent: info.userAgent,
            ipAddress: info.ipAddress,
            attempt: info.attempt,
        },
    });
};
const userLogin = async (req, res, next) => {
    try {
        // get user ip address and user agent
        const ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
        const userAgent = req.headers["user-agent"] || "";
        // validate the request body
        const parseBody = schemas_1.UserLoginSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ message: parseBody.error.errors });
        }
        // check if the user exist
        const user = await prisma_1.default.user.findUnique({
            where: {
                email: parseBody.data.email,
            },
        });
        if (!user) {
            await createLoginHistory({
                userId: user?.id || "Guest",
                userAgent,
                ipAddress,
                attempt: "FAILED",
            });
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // compare password
        const isMatched = await bcryptjs_1.default.compare(parseBody.data.password, user.password);
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
        const accessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET || "my_secret_key", { expiresIn: "2h" });
        await createLoginHistory({
            userId: user?.id,
            userAgent,
            ipAddress,
            attempt: "SUCCESS",
        });
        return res.status(200).json({ accessToken });
    }
    catch (error) {
        next(error);
    }
};
exports.default = userLogin;
//# sourceMappingURL=userLogin.js.map