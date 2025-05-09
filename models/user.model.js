import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    profilePicture : { type : String },
    firstName : { type: String, required: true, index : true },
    lastName : { type : String, required : true, index : true },
    username : { type : String, required : true, unique : true, index : true },
    email : { type : String, required : true, unique : true, index : true },
    role : { type : String, enum : ["ADMIN", "USER", "TECHNICIAN"], default : "USER", index : true },
    password : { type : String, required : true }
}, { timestamps : true });

const User = mongoose.model('users', userSchema);

export default User;