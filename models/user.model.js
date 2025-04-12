import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,

    },
    password:{
        type:String,
        required:true,
        select:false,
    }
})

userSchema.statics.hashPassword=async function(password) {
    return await bcryptjs.hash(password,10)
}

userSchema.methods.isValidPassword=async function (password) {
    
    return await bcryptjs.compare(password,this.password)
}

userSchema.methods.generateJWT=function (){
    return jwt.sign({email:this.email},process.env.JWT_SECRET,{expiresIn:'24h'})
}

const User=mongoose.model("user",userSchema)

export default User;
