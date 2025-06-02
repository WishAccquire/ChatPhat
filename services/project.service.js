import mongoose from "mongoose";
import Project from "../models/project.model.js";




export const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error('Name is required')

    }
    if (!userId) {
        throw new Error('User is required')
    }
    let project;
    try {
        project = await Project.create({
            name,
            users: [userId]
        })
    } catch (err) {
        if (err.code === 11000) {
            throw new Error("Project name can't be same")
        }
        throw err;
    }

    return project;



}

export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error('User is required')
    }

    const alluserproject = await Project.find({ users: userId });
    return alluserproject;
}

export const addUsertoproject = async ({ projectId, users, userId }) => {
    if (!projectId) {
        throw new Error('project Id  is required')
    }
    if (!userId) {
        throw new Error('User Id is required')
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format')
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid UserID format')
    }

    if (!users) {
        throw new Error('User is required')
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    const project = await Project.findOne({ _id: projectId, users: userId })
    if (!project) {
        throw new Error("user does not belong to the project")
    }

    const updateproject = await Project.findByIdAndUpdate({ _id: projectId }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, { new: true })

    return updateproject

}

export const getprojectbyid = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required");

    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format')
    }
    const project = await Project.findOne({ _id: projectId }).populate('users')
    return project

}



