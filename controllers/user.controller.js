import userModel from "../models/user.model.js";
// import redisClient from "../services/redis.service.js";
import {createUser, getAllusers} from '../services/user.service.js'
import { validationResult } from "express-validator";

export const createUserController=async(req,res)=>{
    
     const errors=validationResult(req);
     console.log(errors)
     if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
     }

     try{
        console.log("heelo")
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
   console.log(req.user);

   res.status(200).json({
      user:req.user
   })
}

export const logoutController=async(req,res)=>{
   try{
      const token=req.cookies.token || req.header('Authorization').replace('Bearer ','');

      redisClient.set(token,'logout','EX',60*60*24);

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