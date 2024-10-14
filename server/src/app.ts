import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

import playerRoutes from "./api/playerRoutes";
import { Player } from "./models/Player";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Database setup
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log // You can adjust this based on your logging preferences
});

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Initialize models
Player.initialize(sequelize);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/players", playerRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

export default app;
