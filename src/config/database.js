const mongoose = require("mongoose")


const connectDB = async ()=>{
    await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
    })
}

module.exports = connectDB

