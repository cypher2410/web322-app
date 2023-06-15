/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Dionysios Balasis Student ID: 104360201 Date: June 16, 2023
*
*  Online (Cyclic) Link: https://tame-girdle-clam.cyclic.app
*
********************************************************************************/ 

// use express
var express = require("express");
var app = express();
//since we are working with files we need to include
var path = require("path");
const data = require("./store-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

//cloudinary config
cloudinary.config({
  cloud_name: 'dcuhe1b44',
  api_key: '338653722965531',
  api_secret: '27cezdsT_hgesUMI8jMoPjnOPtc',
  secure: true
});

// Var without disc storage
const upload = multer();

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

//get items/add route
app.get("/items/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addItem.html"));
})

//post items/add route
app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        processItem(uploaded.url);
    });
}else{
    processItem("");
}
 
function processItem(imageUrl){
    req.body.featureImage = imageUrl;
    let itemObject = {};
    //process the new item
    itemObject.category = req.body.category;
    itemObject.postDate = Date.now();
    itemObject.featureImage = req.body.featureImage;
    itemObject.price = req.body.price;
    itemObject.title = req.body.title;
    itemObject.body = req.body.body;
    itemObject.published = req.body.published;
}
//if the entries are correct add item to items
// and redirect to items
if (itemObject.title) {
  addItem(itemObject);
}
res.redirect("/items");
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
  if(req.query.category){
    data.getItemsByCategory(req.query.category)
    .then((data) => {
      res.send(data);
    })
    // Error Handler
    .catch((err) => {
      res.send(err);
    });
  }
  else if(req.query.minDate){
    data.getItemsByMinDate(req.query.minDate)
    .then((data) => {
      res.send(data);
    })
    // Error Handler
    .catch((err) => {
      res.send(err);
    });
  }
  else{
    data.getAllItemss()
      .then((data) => {
        res.send(data)
      })
      .catch((err) => {
        res.send(err);
      });
  }
  });

//find item using id route
app.get("/item/:value", (req, res) => {
  data.getItemById(req.params.value)
  .then((data) => {
    res.send(data);
  })
  // Error Handler
  .catch((err) => {
    res.send(err);
  });
})   
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
