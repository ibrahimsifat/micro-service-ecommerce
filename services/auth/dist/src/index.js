"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const controller_1 = require("./controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});
// routes
app.post("auth/registration", controller_1.userRegistration);
app.post("auth/login", controller_1.userLogin);
app.post("auth/verify-token", controller_1.verifyToken);
// app.use((req, res, next) => {
//   const allowedOrigins = ["http://localhost:8081", "http://172.17.0.1:8081"];
//   const origin = req.headers.origin;
//   if (origin && allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//     next();
//   } else {
//     res.status(403).json({ message: "Forbidden" });
//   }
// });
// routes
//  404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
});
//  error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});
const PORT = process.env.PORT || 4003;
const serviceName = process.env.SERVICE_NAME || "Auth-Service";
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map