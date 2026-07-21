import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = async (req,res,next)=>{
    try{
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                city: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        req.user = user;
        next();

    } catch (error){
        if ( error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"){
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token",
            });
        }
        next(error);
    }
};