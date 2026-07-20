import jwt from 'jsonwebtoken';

export const generateToken = async (userid) => {
    if (!process.env.JWT_SECRET) throw new error("JWT_SECRET is not configured");

    return jwt.sign(
        {userid},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
};

export const setAuthCookie = (res,token) => {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token",token,{
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7*24*60*60*1000,
        path:'/',
    });
};