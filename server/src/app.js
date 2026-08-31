import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.route.js';
import petRoutes from "./routes/pet.routes.js";
import likeRoutes from "./routes/like.routes.js";
import adoptionRoutes from "./routes/adoption.routes.js";

const app = express();

app.use(helmet());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const port = 3000;

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the PawMatch API",
    });
});

app.use('/api/health',healthRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/pets',petRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/adoptions", adoptionRoutes);

app.use((req,res)=>{
    res.status(404).json({
        success: false,
        message: `route not found: ${req.method} ${req.originalUrl}`,
    });
});

app.use((error,req,res,next)=>{
    console.error(error);

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
    });
});

export default app; 