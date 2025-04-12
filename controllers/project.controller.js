import Project from "../models/project.model.js";
import { createProject } from "../services/project.service";
import { validatonResult} from 'express-validator';
import userModel from '../models/user.model.js';


export const createProjectController = async (req, res)=>{
    const errors=validatonResult(req);
     console.log(errors)
     if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
     }
     try{
        const{ name }= req.body;
     const loggedInUser = await userModel.findOne({email:req.user.email});
     const userId=loggedInUser._id
    const newProject=await createProject({name,userId})
    res.status(201).json(newProject)

     }catch(err){
        console.log(err);
        res.status(400).send(err.message)
        
     }
     
    



}