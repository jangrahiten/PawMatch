import { loginUser, registerUser } from "../services/auth.service.js";
import { clearAuthCookie, generateToken, setAuthCookie } from "../utils/jwt.js";

export const register = async (req,res,next) => {
    try{
        const {name,email,password,role,city} = req.body;

        if (!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: "Password must contain atleast 8 characters",
            });
        }

        const user = await registerUser({name,email,password,role,city});
        const token = generateToken(user.id);
        setAuthCookie(res,token);

        return res.status(200).json({
            success: true,
            message: "Account created successfully",
            user,
        });
    } catch(error){
        next(error);
    }
};

export const login = async (res,req,next) => {
    try{
        const {email,password} = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await loginUser({email,password});
        const token = await generateToken(user.id);

        setAuthCookie(res,token);

        return res.status(200).json({
            success: true,
            message: "Logged in Successfully",
            user,
        });
    } catch(error){
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