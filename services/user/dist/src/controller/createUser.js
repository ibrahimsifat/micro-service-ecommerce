"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const createUser = async (req, res, next) => {
    try {
        // validate the request body
        const parseBody = schemas_1.UserCreateSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ message: parseBody.error.errors });
        }
        // check if the authUserId already exist
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                authUserId: parseBody.data.authUserId,
            },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exist" });
        }
        // create the user
        const user = await prisma_1.default.user.create({
            data: parseBody.data,
        });
        return res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.default = createUser;
//# sourceMappingURL=createUser.js.map