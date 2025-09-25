import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { prisma } from "./lib/database.js";
import apiRoutes from "./routes/index.js";
import { versionMiddleware } from "./middlewares/versionMiddleware.js";

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(versionMiddleware);

// Rutas de la API con prefijo /api
app.use("/api", apiRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SIVAPI",
    versions: {
      v1: "/api/v1",
      current: "v1",
    },
    documentation: "/api/v1/docs", // Puedes agregar documentación después
  });
});

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`
  );
  next(); // Passes control to the next handler
});

// Manejo de errores
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      version: "v1",
    });
  }
);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
