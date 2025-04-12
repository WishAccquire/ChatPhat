import userModel from '../models/user.model.js'
import validator from 'validator'

export const createUser = async ({ email, password }) => {

    try {
        
        if (!email || !password) {
            throw new Error("Please Enter Email Or Password")
        }

        const valid = validator.isEmail(email);

        if (!valid) {
            throw new Error("Please Enter Correct Email")

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

