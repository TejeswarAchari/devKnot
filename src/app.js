const express = require("express")
const connectDB = require("./config/database")
const validator = require("validator")
const{ validateSignUpData} = require("./utils/validation")
const bcrypt = require("bcrypt")
const app = express()

app.use(express.json())
const User = require("./models/user")

app.post("/signup", async (req,res)=>{
    try{
    validateSignUpData(req)
    const {firstName,lastName,email,password} = req.body
    const passwordHash = await bcrypt.hash(password,10)

       const userObj = {
        firstName,
        lastName,
        email,
        password:passwordHash
       }
    const user = new User(userObj)
   await user.save()
  res.send("User Signed Up Successfully")
    }
    catch(err){
        return res.status(400).send(err.message)
    }
 
})

//login route
app.post("/login",async (req,res)=>{
    const {email,password} = req.body  
    try{
        const user = await User.findOne({email:email})
        if(!user){
            throw new Error("Invalid Credentials")
        }
        const isPasswordMatch = await bcrypt.compare(password,user.password)
        if(!isPasswordMatch){
            throw new Error("Invalid Credentials")
        }
    }catch(err){
        return res.status(400).send(err.message)
    } 
    res.send("User Logged In Successfully")
}  
)


app.get("/user",async (req,res)=>{
    const userEmail = req.body.email;
    console.log(userEmail)
    try{
     const Users =  await User.find({email:userEmail});
     res.send(Users)
    }
    catch(err){
        res.status()
    } 
 
})

app.delete("/user",async (req,res)=>{
    const userId = req.body._id
    // console.log(userId)
    try{
        const user = await User.findByIdAndDelete(userId)
        res.send("User Deleted Sucessfully")
    }
    catch(err){
        res.status(400).send("Something went Wrong")
    }
})

app.patch("/user:userId",async (req,res)=>{
    const userId = req.params?.userId;
    const data = req.body
    
    try{
        const AllowedUpdates = ["age","photoUrl","about","skills","gender"];
        const isUpdateAllowed = Object.keys(data).every((k)=>{
            return AllowedUpdates.includes(k)
        } 
    );
    if(!isUpdateAllowed){
        return res.status(400).send("Update Not Allowed")
    }
    if(data?.skills.length>10){
        return res.status(400).send("Skills cannot be more than 10")
    }
  const updatedUser = await User.findOneAndUpdate(
    { email: userMail},
      data,
      { new: true, runValidators: true }   // return updated doc + validate
    );

res.send("Updated Sucessfully")
    }
    catch(err){
        res.status(400).send("Something Went wrong")
    }
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
