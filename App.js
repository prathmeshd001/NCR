//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", function(req,res){
    res.status(200).sendFile(__dirname +"/signIn.html");
});

app.post("/", function(req,res){
    // console.log(req.body.gridRadios);
    if (req.body.gridRadios === "1" ) {
        res.redirect("/admin");
    }else{
        res.redirect("/supplier"); 
    }
    // console.log("working");
});

app.get("/admin", function(req,res){
    res.status(200).sendFile(__dirname +"/views/home.html");
});

app.get("/dashboardYears", function(req,res){
    res.status(200).sendFile(__dirname +"/views/DashboardYears.html");
});

app.get("/supplier", function(req,res){
    res.status(200).sendFile(__dirname +"/views/supplierHome.html");
});


app.listen(3000,function(){
    console.log("Server running on port 3000.");
});