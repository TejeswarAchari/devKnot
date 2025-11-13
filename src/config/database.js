const mongoose = require("mongoose")
const connectDB = async ()=>{
    await mongoose.connect("mongodb+srv://vteja797_db_user:zEaV0SRdPzBktrXx@cluster0.cefiksk.mongodb.net/devKnot")
}

module.exports = connectDB
