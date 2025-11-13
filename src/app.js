const express = require("express")
const app = express()

app.get("/user",(req,res)=>{
    res.send({"Name":"Tejeswar Achari","Age":20})
})
app.post("/user",(req,res)=>{
    res.send("File Saved")

})
app.delete("/user",(req,res)=>{
    res.send("File Deleted Sucessfully")
})

app.patch("/user",(req,res)=>{
    res.send("Patched Sucessfully")
})
app.listen(3000,()=>{
    console.log("Server Started at PORT 3000...")
})
