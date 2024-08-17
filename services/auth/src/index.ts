import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { userLogin, userRegistration, verifyToken } from "./controller";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// routes
app.post("auth/registration", userRegistration);
app.post("auth/login", userLogin);
app.post("auth/verify-token", verifyToken);

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
