import userModel from '../models/user.model.js'
import validator from 'validator'
import OTP from '../models/OTP.model.js'

export const createUser = async ({ email, password,otp }) => {

    try {
        
        
        if (!email || !password || !otp) {
            throw new Error("Please Enter Email Or Password or otp")
        }

        const valid = validator.isEmail(email);
        
        if (!valid) {
            throw new Error("Please Enter Correct Email")

        }

        const recentOtp=await OTP.find({Email:email}).sort({createdAt:-1}).limit(1);
        console.log("recent otp",recentOtp);

        //validate
        if(recentOtp.length==0|| !recentOtp[0]){
            return res.status(401).json({
                success: false,
                message: "OTP Not Fount"
            })
        }

        else if( otp.toString()!==recentOtp[0].Otp.toString()){
            return res.status(401).json({
                success: false,
                message: "Invalid OTP. ENter Valid OTP"
            })
        }

        const hashPassword = await userModel.hashPassword(password);
        const user = await userModel.create({
            email,
            password: hashPassword
        });
        

        return user
    } catch (error) {
        throw new Error(error.message)
    }

}

export const getAllusers=async({userId})=>{
    const users=await userModel.find({_id:{$ne:userId}});
    return users
}

