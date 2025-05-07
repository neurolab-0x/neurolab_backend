import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../utils/generate.token.js";

export const register = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if(existingUser) {
            console.log(existingUser);
            return res.status(404).json({ message : "User already exist" });
        };
        const hashedPassword = await bcrypt.hash(password, 20);
        const newUser = new User({ firstName, lastName, username, email, password: hashedPassword });
        await newUser.save();
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        console.log(userWithoutPassword);
        return res.status(200).json({ message : "Registration successfull", userWithoutPassword });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server error" })
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message : "User not found" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({ message : "Invalid credentials" });
        }
        const token = generateToken(user);
        req.headers.authorization = token;
        const { password: _, ...userWithoutPassword } = user.toObject();
        return res.status(200).json({ message : "Login successfull", token, userWithoutPassword });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server error" })
    }
}