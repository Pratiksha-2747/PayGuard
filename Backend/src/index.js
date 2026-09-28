import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config()

connectDB()
.then( () => {
    app.on("error", (err) => {
        console.log("Error in Express App ! ", err);
        throw err;
    })

    app.listen(process.env.PORT || 8000, () =>{
        console.log(`server is running on port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("Mongo DB connection failed !!! ", err);
})