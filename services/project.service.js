import Project from "../models/project.model.js";




export const createProject = async ({
    name, userId
}) => {
    if (!name){
        throw new Error('Name is required')

    }
    if (!userId){
        throw new Error('User is required')
    }
    let project;
    try{
        project=await Project.create({
            name,
            users:[userId]
        })
    }catch(err){
        if(err.code===11000){
            throw new Error("Project name can't be same")
        }
        throw err;
    }

    return project;



 }

export const getAllProjectByUserId=async({userId})=>{
    if (!userId){
        throw new Error('User is required')
    }

    const alluserproject=await Project.find({users:userId});
    return alluserproject;
}

export const addUsertoproject=async({projectId,users})=>{
    if (!projectId){
        throw new Error('project Id  is required')
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format')
    }
    
    if (!users){
        throw new Error('User is required')
    }


    for (const userId of users) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format in users array')
        }
    }

}



