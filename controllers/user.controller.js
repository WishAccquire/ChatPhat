import userModel from "../models/user.model.js";
// import redisClient from "../services/redis.service.js";
import {createUser, getAllusers} from '../services/user.service.js'
import { validationResult } from "express-validator";
import validator from "validator";
import otpGenerator from 'otp-generator';
import OTP from "../models/OTP.model.js";
import { mail } from "../utils/mail.js";

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const valid = validator.isEmail(email);

        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Please Enter Correct Email"
            });
        }

        const checkEmail = await userModel.findOne({ email });

        if (checkEmail) {
            return res.status(401).json({
                success: false,
                message: "The Email is Already Registered"
            });
        }

        let generateotp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await OTP.findOne({ Otp: generateotp });

        while (result) {
            generateotp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            result = await OTP.findOne({ Otp: generateotp });
        }

        const payload = {
            Email: email,
            Otp: generateotp,
        };

        const otpBody = await OTP.create(payload);

       // console.log("OTP Saved:", otpBody);

        return res.status(201).json({
            success: true,
            message: "OTP Sent Successfully"
        });

    } catch (err) {
        console.log("SEND OTP ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
export const createUserController=async(req,res)=>{
    
     const errors=validationResult(req);
     console.log(errors)
     if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
     }

     try{
        const user=await createUser(req.body);
        const token=await user.generateJWT();
        delete user._doc.password;
        res.status(201).json({user,token});

     }catch(error){
        res.status(400).send(error.message);
     }
}

export const LoginController=async(req,res)=>{
   
   const errors=validationResult(req);
   console.log(errors)
   if(!errors.isEmpty()){
   
      return res.status(400).json({errors:errors.array()});
   }

   try{
     
      const {email,password}=req.body;

      const valid = validator.isEmail(email);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Please Enter Correct Email"
            })
        }
      
      const user=await userModel.findOne({email}).select('+password')
      
      if(!user){
         return res.status(401).json({
            errors:'Invalid credentials'
         })
      }
      
      const isMatch=await user.isValidPassword(password);

      if(!isMatch){
         return res.status(401).json({
            errors:'Invalid credentials'
         })
      }

      const token=await user.generateJWT();
      res.cookie('token',token)
      delete user._doc.password;
      res.status(200).json({user,token})
   }catch(error){
      console.log(error)
      res.status(400).send(error.message);
   }
}

export const profileController=async(req,res)=>{
   //console.log(req.user);

   res.status(200).json({
      user:req.user
   })
}

export const logoutController=async(req,res)=>{
   try{
      const token=req.cookies.token || req.header('Authorization').replace('Bearer ','');

      //redisClient.set(token,'logout','EX',60*60*24);

      res.status(200).json({
         message:"logged out succefully"
      })

   }catch(err){
      console.log(err)
      res.status(400).send(err.message);
   }
}

export const getAllUsersController=async (req,res)=>{
   try{
      const loggedInUser=await userModel.findOne({email:req.user.email})
      const users=await getAllusers({userId:loggedInUser._id});
      return res.status(200).json({
         users
      })

   }catch(err){
       console.log(err)
       res.status(400).json({err:err.message})
   }
}
