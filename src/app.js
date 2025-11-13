const express = require("express")
const app = express()
app.use("/test",(req,res)=>{
    res.send("Hello from all")
})
app.use((req,res)=>{
    res.send("Hello Node")
})

app.listen(3000,()=>{
    console.log("Server Started at 3000...")
})

