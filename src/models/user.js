const mongoose = require('mongoose');
const validator = require('validator');
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
   
},{timestamps:true});

const User = mongoose.model('User', userSchema);

module.exports = User;