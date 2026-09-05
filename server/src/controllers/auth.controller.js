import { loginUser, registerUser } from "../services/auth.service.js";
import {
   clearAuthCookie,
   generateSocketToken,
   generateToken,
   setAuthCookie,
} from "../utils/jwt.js";

export const register = async (req, res, next) => {
   try {
      const user = await registerUser(req.body);

      const token = generateToken(user.id);

      setAuthCookie(res, token);

      return res.status(201).json({
         success: true,
         message: "Account created successfully",
         user,
      });
   } catch (error) {
      next(error);
   }
};

export const login = async (req, res, next) => {
   try {
      const user = await loginUser(req.body);

      const token = generateToken(user.id);

      setAuthCookie(res, token);

      return res.status(200).json({
         success: true,
         message: "Logged in successfully",
         user,
      });
   } catch (error) {
      next(error);
   }
};

export const logout = async (req, res) => {
   clearAuthCookie(res);

   return res.status(200).json({
      success: true,
      message: "Logged out successfully",
   });
};

export const getMe = async (req, res) => {
   return res.status(200).json({
      success: true,
      user: req.user,
   });
};

export const getSocketToken = async (req, res) => {
   try {
      const token = generateSocketToken(req.user.id);

      return res.status(200).json({
         token,
      });
   } catch (error) {
      console.error("SOCKET TOKEN ERROR:", error);

      return res.status(500).json({
         message: "Unable to generate socket token",
      });
   }
};
