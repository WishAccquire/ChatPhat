import Project from "../models/project.model";




export const createProject = async ({
    name, userId
}) => {
    if (!name){
        throw new Error('Name is required')

    }
    if (!userId){
        throw new Error('User is required')
    }
    const project = await Project.create({
        name,
        users: [userId]
    })

    return project;



 }



