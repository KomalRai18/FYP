import mongoose from "mongoose"
import { DB_NAME } from './common/constants/constant.js'

const ConnectionDB = async()=>{
    try {
        console.log(`Mongoose uri ${process.env.MONGO_URI}`)
        const connectionIns = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n Mongoose Connection instance  ${connectionIns.connection.host}`)
    } catch (error) {
        console.log(`Error ${error}`)
        process.exit(1)
    }
}

export default ConnectionDB