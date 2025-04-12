import mongoose from "mongoose";
import 'dotenv/config'

function connect() {
    mongoose.connect(process.env.MONGO_URL).then(() => {
        console.log("Connected to Db")
    })
        .catch(err => {
            console.log(err);
        })
}

export default connect