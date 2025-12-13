const express = require('express');
const {userAuth} =require ("../middlewares/auth") ;
const {validateEditProfileData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = require("../utils/multerMemory");
const { cloudinary } = require("../config/cloudinary");



const profileRouter = express.Router();

const extractPublicId = (url) => {
  if (!url) return null;

  const parts = url.split("/");
  const fileName = parts.pop().split(".")[0];
  const folder = parts.pop();
  return `${folder}/${fileName}`;
};


profileRouter.get("/profile/view",userAuth,async (req,res)=>{

    try{
        const user = req.user
        res.send(user)
    }
    catch(err){
        res.status(400).send("Error: "+err.message )
    }
});

// profileRouter.patch("/profile/update",userAuth,async (req,res)=>{
//    try{
// if(!validateEditProfileData(req.body)){
//     throw new Error("Update Not Allowed");
// }
// const loggedInUser = req.user;
// Object.keys(req.body).forEach((key)=>{
//     loggedInUser[key]= req.body[key];
// } 
// );
// await loggedInUser.save();
//   res.status(200).json({ data: loggedInUser });

//    }catch(err){
//     res.status(400).send("Error: "+err.message )
//    }
// });


profileRouter.patch(
  "/profile/update",
  userAuth,
  upload.single("photo"), // 👈 accept image file
  async (req, res) => {
    try {
      const user = req.user;

      const { firstName, lastName, about, gender, age } = req.body;

      // Update text fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (about) user.about = about;
      if (gender) user.gender = gender;
      if (age) user.age = age;

      // 👇 Image upload logic
    if (req.file) {
  // 🔥 delete old image (if not default)
  if (
    user.photoUrl &&
    !user.photoUrl.includes("dummy-user.png")
  ) {
    const publicId = extractPublicId(user.photoUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  // upload new image
  const uploadResult = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    {
      folder: "devknot_profiles",
      resource_type: "image",
    }
  );

  user.photoUrl = uploadResult.secure_url;
}


      await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        data: user,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);



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


