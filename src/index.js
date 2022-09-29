const express =require('express')
const mongoose=require('mongoose')
const app= express();
const route=require("./routes/route");


app.use(express.json());


mongoose.connect("mongodb+srv://Adesh:LnDEhxK0maoDwQD9@cluster0.r3pzigx.mongodb.net/Adesh1947=DB",
{
    useNewUrlParser:true
}
)
.then(()=>console.Consolelog(" mongoDB is connected"))
.catch((err)=>console.log(err))

app.use('./',route)

app.listen(process.env.PORT || 3000, function(){
    console.log('Express app running on port' + (process.env.PORT||3000));
})