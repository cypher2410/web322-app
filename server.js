/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Dionysios Balasis Student ID: 104360201 Date: June 1, 2023
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 

// use express
var express = require("express");
var app = express();
//since we are working with files we need to include
var path = require("path");
const data = require("./store-service");
//listen port 8080
var HTTP_PORT = process.env.PORT || 8080;

//output the port
function onHttpStart(){
    console.log("Express http server listening on port " + HTTP_PORT);
}

//"static" middleware
app.use(express.static('public')); 


//starting page route
app.get("/", (req,res) => {
    res.redirect("/about");
  });

//about route
app.get("/about", function(req,res) {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});


//shop route
app.get("/shop", (req, res) => {
    data.getPublishedItems()
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res.send(err);
    })
  });

//items route
app.get("/items", (req, res) => {
    data.getAllItemss()
      .then((data) => {
        res.send(data)
      })
      .catch((err) => {
        res.send(err);
      })
  });

//categories toute
app.get("/categories", (req, res) => {
    data.getCategories()
    .then((data) => {
      res.send(data)
    })
    // Error Handling
    .catch((err) => {
      res.send(err);
    })
  });



//404 handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404page.html"));
})  
//setup http server to listen on HTTP_PORT
//include an error in case it doent start
data.initialize().then(function(){
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err){
    console.log("Unable to start: " + err);
})