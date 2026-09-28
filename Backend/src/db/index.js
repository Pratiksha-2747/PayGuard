import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try{
        const connectionInstacnce = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        console.log(`\n MongoDB connected !! DB Host : ${connectionInstacnce.connection.host}`)
        
    } catch(error){
        console/log("MONGODC connection FAILED", error);
        process.exit(1);
    }
}

export default connectDB;