const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required:true,
        minLength:4,
        maxLength:30,
        
    },
    lastName: {
        type: String,  
        required:true,
     
    },
    email: {
        type: String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true, 
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid"+value)
            }
        }      
    },
    password: {
        type: String,
        required:true,
          validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a Strong Password "+value)
            }
        }  
    },
    age:{
        type: Number,
        min:18,

    },
    gender:{
        type: String,
        lowercase:true,
        validate(value){
            if(!["male","female","other"].includes(value)){
                throw new Error("Gender must be male, female or other")
            }
        }
    },
    photoUrl:{
        type:String,
        default:"https://weimaracademy.org/wp-content/uploads/2021/08/dummy-user.png",
          validate(value){
            if(!validator.isURL(value)){
                throw new Error("Url is invalid"+value)
            }
        }  
    },
    about:{
        type:String,
        default:"This is about section of the user"

    },
    skills:{
        type:[String]
    },
    lastSeen: {
  type: Date,
  
},

   
},{timestamps:true});

// Index for faster email lookups
userSchema.index({ email: 1 });

userSchema.methods.getJWT = function(){
    
    const user = this;
    const token = jwt.sign(
        { userId: user._id, email: user.email },    
        process.env.JWT_SECRET_KEY,
        { expiresIn: '7d' }
    );  
    return token;
}
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};


const User = mongoose.model('User', userSchema);

module.exports = User;