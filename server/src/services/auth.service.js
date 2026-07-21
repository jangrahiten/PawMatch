import prisma from "../config/prisma.js";
import { comparePassword, hashpassword } from "../utils/password.js";

const allowedRoles = ["ADOPTER", "SHELTER", "OWNER"];

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  city: true,
  createdAt: true,
};


export const registerUser = async({name,email,password,role="ADOPTER",city}) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.toUpperCase();

    if(!allowedRoles.includes(normalizedRole)){
        const error = new Error("Invalid user role");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        const error = new Error("An account with this email already exists");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await hashpassword(password);

    const user = await prisma.user.create({
        data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole,
        city: city?.trim() || null,
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
    return user;
}

export const loginUser = async ({email,password}) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (!user){
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatched = await comparePassword(password,user.password);

    if (!passwordMatched) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const {password: _, ...safeUser} = user;
    return safeUser;
};