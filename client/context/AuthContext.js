"use client";

import api from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    const fetchMe = async ()=>{
        try {
            const response = await api.get("/auth/me");
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchMe();
    }, []);

    const login = async (email,password)=>{
        const response = await api.post("/auth/login", {
            email,password,
        });

        setUser(response.data.user)
        return response.data;
    }

    const register = async (data) =>{
        const response = await api.post("/auth/register", data);

        setUser(response.data.user);

        return response.data;
    }

    const logout = async ()=>{
        await api.post("/auth/logout");
        setUser(null);
    }

    return (<AuthContext.Provider value={{user,loading,login,register,logout,fetchMe}}>{children}</AuthContext.Provider>);
}

export const useAuth = () =>{
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};