const express = require('express');
const {userAuth} =require ("../middlewares/auth") ;
const {validateEditProfileData} = require("../utils/validation");
const bcrypt = require("bcrypt");


const profileRouter = express.Router();

profileRouter.get("/profile/view",userAuth,async (req,res)=>{

    try{
        const user = req.user
        res.send(user)
    }
    catch(err){
        res.status(400).send("Error: "+err.message )
    }
});

profileRouter.patch("/profile/update",userAuth,async (req,res)=>{
   try{
if(!validateEditProfileData(req.body)){
    throw new Error("Update Not Allowed");
}
const loggedInUser = req.user;
Object.keys(req.body).forEach((key)=>{
    loggedInUser[key]= req.body[key];
} 
);
await loggedInUser.save();
  res.status(200).json({ data: loggedInUser });

   }catch(err){
    res.status(400).send("Error: "+err.message )
   }
});





profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Basic validation
    if (!oldPassword || !newPassword) {
      throw new Error("Old password and new password are required");
    }

    
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }

    const user = req.user; // logged-in user (from userAuth middleware)

    // 2. Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Save new password
    user.password = hashedPassword;
    await user.save();

       res.status(200).json({ data: user });

  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});


module.exports = profileRouter;


