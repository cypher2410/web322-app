
// use express
var express = require("express");
var app = express();
//since we are working with files we need to include
var path = require("path");
//listen port 8080
var HTTP_PORT = process.env.PORT || 8080;

//output the port
function onHttpStart(){
    console.log("Express http server listening on port " + HTTP_PORT);
}

//"static" middleware
app.use(express.static('public')); 

//about route
app.get("/", function(req,res) {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});


//setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);