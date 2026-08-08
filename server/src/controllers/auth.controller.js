import { loginUser, registerUser } from "../services/auth.service.js";
import { clearAuthCookie, generateToken, setAuthCookie } from "../utils/jwt.js";

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

export const logout = async (req,res)=>{
    clearAuthCookie(res);

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

export const getMe = async (req,res) => {
    return res.status(200).json({
        success: true,
        user: req.user,
    });
};