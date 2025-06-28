import mongoose from "mongoose";
import { mail } from "../utils/Mail.js";
import otpTemplate from "../template/EmailVerification.js";

const OtpSchema=new mongoose.Schema({

  Email:{
    type:String,
    required:true,
  },
  CreatedAt:{
    type:Date,
    default:Date.now(),
    expires:5*60*1000,
  },
  Otp:{
    type:String,
    required:true,
  }
    
})

async function verification(Email,Otp) {
    try{
        const mailResponse=await mail(Email,"Verification Email From StudyNotion",otpTemplate(Otp));
       
        console.log("Mail Send Successfully",mailResponse);

    }catch(err){
        console.log("error occured will send mail",err.message);
        throw err;
    }
}

OtpSchema.pre("save",async function(next){
  //console.log("hello");
    const ir=await verification(this.Email,this.Otp);
    next();
}
)

const OTP = mongoose.model("OTP", OtpSchema);
export default OTP;