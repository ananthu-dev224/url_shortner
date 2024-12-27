import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const url = process.env.MONGO_URL;
        await mongoose.connect(url);
        console.log('Db connected...')
    } catch (error) {
        console.log('Error in connecting Db',error.message)
    }
}

export default connectDb;