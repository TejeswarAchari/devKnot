const express = require("express")
const connectDB = require("./config/database")
const cors = require("cors")
const validator = require("validator")
const{ validateSignUpData} = require("./utils/validation")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const {userAuth} =require ("./middlewares/auth") ;
const User = require("./models/user")


const app = express()// ------------ SIMPLE CORS MIDDLEWARE -------------
app.use((req, res, next) => {
  // Frontend origin
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  // Allow cookies
  res.header("Access-Control-Allow-Credentials", "true");
  // Allowed methods
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS"
  );
  // Allowed headers
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No content, CORS OK
  }

  next();
});


app.use(express.json())
app.use(cookieParser())

const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/request")
const userRouter = require("./routes/user")

app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)

// GET by email using query param: /user?email=someone@example.com
app.get("/user", async (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) return res.status(400).send("Provide ?email=...");
  try {
    const users = await User.find({ email: userEmail });
    res.json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.delete("/user",async (req,res)=>{
    const userId = req.body._id
    
    try{
        const user = await User.findByIdAndDelete(userId)
        res.send("User Deleted Sucessfully")
    }
    catch(err){
        res.status(400).send("Something went Wrong")
    }
})

// PATCH route to update allowed fields
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  try {
    const AllowedUpdates = ["age", "photoUrl", "about", "skills", "gender"];
    const isUpdateAllowed = Object.keys(data).every((k) => AllowedUpdates.includes(k));

    if (!isUpdateAllowed) {
      return res.status(400).send("Update Not Allowed");
    }

    // If skills present, validate it's an array and limit length
    if (data.skills !== undefined) {
      if (!Array.isArray(data.skills)) {
        return res.status(400).send("Skills must be an array");
      }
      if (data.skills.length > 10) {
        return res.status(400).send("Skills cannot be more than 10");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).send("User not found");

    res.json(updatedUser);
  } catch (err) {
    res.status(400).send("Something went wrong: " + err.message);
  }
});

connectDB().then(()=>{
    console.log("Database Connection Established")
    app.listen(7777,()=>{
        console.log("Database Connected Successfully at Port 7777...")
    })
})
.catch((err)=>{
    console.error("Database cannot be connected !!")
})
