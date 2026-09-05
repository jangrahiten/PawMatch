import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
   if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
   }

   return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
   });
};

export const verifyToken = (token) => {
   if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
   }

   return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateSocketToken = (userId) => {
   if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
   }

   return jwt.sign(
      {
         userId,
         purpose: "socket",
      },
      process.env.JWT_SECRET,
      {
         expiresIn: "5m",
      },
   );
};

export const verifySocketToken = (token) => {
   if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
   }

   const decoded = jwt.verify(token, process.env.JWT_SECRET);

   if (decoded.purpose !== "socket") {
      throw new Error("Invalid socket token");
   }

   return decoded;
};

export const setAuthCookie = (res, token) => {
   const isProduction = process.env.NODE_ENV === "production";

   res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
   });
};

export const clearAuthCookie = (res) => {
   const isProduction = process.env.NODE_ENV === "production";

   res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
   });
};
