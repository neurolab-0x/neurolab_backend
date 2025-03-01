const User = require('../models/user.model.js');
const bcrypt = require('bcrypt')


export const register = async (req, res) => {
    const { fullName, email, username, role, password } = req.body;
    try{
        const existing_user = await User.findOne({ email });
        if(existing_user){
            return res.status(403).json({ message : "User already exists" })
        }
        const salt = bcrypt.genSalt(20);
        const hashedPassword = bcrypt.hash(password, salt);
        const user = new User({ fullName, email, username, role, password : hashedPassword });
        await user.save();
        return res.status(200).json({ message : "User registered successfully" })

    }catch(error){

    }
}