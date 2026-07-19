import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRouter from './routes/health.routes.js';

const app = express();

app.use(helmet());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials: true,
    })
);

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

app.use('/api/health',healthRouter);

app.use((req,res)=>{
    res.status(404).json({
        success: false,
        message: `route not found: ${req.method} ${req.originalUrl}`,
    });
});

app.use((error,req,res,next)=>{
    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

export default app;