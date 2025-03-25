import { User } from "../models/userSchema.js";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncError(async(req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return next(new ErrorHandler("Authentication token is missing", 401));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ErrorHandler("User not found", 401));
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new ErrorHandler("Token has expired", 401));
        }
        return next(new ErrorHandler("Invalid token", 401));
    }
});