import Project from "../models/project.model.js";
import { addUsertoproject, createProject, getAllProjectByUserId, getprojectbyid } from "../services/project.service.js";
import { validationResult} from 'express-validator';
import userModel from '../models/user.model.js';


export const createProjectController = async (req, res)=>{
    const errors=validationResult(req);
     console.log(errors)
     if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
     }
     try{
        const{ name }= req.body;
        console.log(req.body)
     const loggedInUser = await userModel.findOne({email:req.user.email});
     const userId=loggedInUser._id
    const newProject=await createProject({name,userId})
    res.status(201).json(newProject)

     }catch(err){
        console.log(err);
        res.status(400).send(err.message)
        
     }
}

export const getAllProject = async (req, res)=>{
   
    try{
      const loggedInUser=await userModel.findOne({email:req.user.email})
      const alluserproject=await getAllProjectByUserId({userId:loggedInUser._id})
      return res.status(200).json({
         projects:alluserproject
      })

    }catch(err){
       console.log(err);
       res.status(400).json({error:err.message})
       
    }
}

export const adduserToProject=async(req,res)=>{
   const errors=validationResult(req)

   if(!errors.isEmpty()){
      return res.status(400).json({error:errors.array()})
   }
   try{

      const {projectId,users}=req.body

      const loggedUser=await userModel.findOne({
         email:req.user.email
      })
      const project=await addUsertoproject({projectId,users,userId:loggedUser._id})
      return res.status(200).json(project)

    }catch(err){
       console.log(err);
       res.status(400).json({error:err.message})
       
    }
}

export const getProject=async (req,res)=>{
   const {projectId}=req.params;
   try{
      const project = await getprojectbyid({projectId})
      return res.status(200).json(project)


   }catch(err){
      console.log(err);
      res.status(400).json({error:err.message})
   }
}

export const updateFileTree=async (req,res)=>{
   const errors=validationResult(req)

   if(!errors.isEmpty()){
      return res.status(400).json({error:errors.array()})
   }
   try{

      const {projectId,fileTree}=req.body

      const project=await updateFileTree({projectId,fileTree})
      return res.status(200).json(project)

    }catch(err){
       console.log(err);
       res.status(400).json({error:err.message})
       
    }
}