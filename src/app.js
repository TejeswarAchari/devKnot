const express = require("express")
const connectDB = require("./config/database")
const app = express()

const User = require("./models/user")
app.post("/signup", async (req,res)=>{
    const userObj = {
        firstName : "Prudhvi Teja",
        lastName : "Achari",
        email : "prudhviteja@gmail.com",
        password : "prudhvi123",
    }
    const user = new User(userObj)
   await user.save()
  res.send("User Signed Up Successfully")
})
connectDB().then(()=>{
    console.log("Database Connection Established")
    app.listen(7777,()=>{
        console.log("Database Connected Successfully at Port 7777...")
    })
})
.catch((err)=>{
    console.error("Database cannot be connected !!")
})