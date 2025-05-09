import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const authenticateAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(404).json({ message : "Token not found" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(404).json({ message : "Token invalid or expired" });
        };
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({ message : "User not found" });
        }
        
        if(user.role !== "ADMIN"){
            console.log(decoded)
            return res.status(403).json({ message : "Access denied" });
        };
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message : "Error in auth middleware" });
    }
}