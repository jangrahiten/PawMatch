import { registerUser } from "../services/auth.service.js";
import { generateToken, setAuthCookie } from "../utils/jwt.js";

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