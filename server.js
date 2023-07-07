/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Dionysios Balasis Student ID: 104360201 Date: July 06, 2023
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
const exphbs = require('express-handlebars')

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

// Register handlebars as the rendering engine for views
app.engine(".hbs", exphbs.engine({ 
  extname: ".hbs",
  helpers: {
    navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }           
} 
}));
app.set("view engine", ".hbs");

//"static" middleware
app.use(express.static('public')); 

//fix the correct navigation bar
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


//starting page route
app.get("/", (req,res) => {
    res.redirect("/shop");
  });

//about route
app.get("/about", function(req,res) {
    res.render(path.join(__dirname,"/views/about.hbs"));
});

//get items route
app.get("/items", (req, res) => {
  data.getAllItemss(req.query.category)
  .then((data) => {
    res.render("items", { items: data });
  })
  .catch((err) => {
    res.render("items", { message: "no results" });
  })
});
//get items/add route
app.get("/items/add", (req, res) => {
  res.render(path.join(__dirname, "views", "addItem.hbs"));
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
app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let items = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      items = await data.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await data.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = items[0];

    // store the "items" and "post" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await data.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

//show a specific item (by id).
app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned items by category
      if(req.query.category){
          // Obtain the published "items" by category
          items = await data.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "items"
          items = await data.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await data.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await data.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
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
      res.render("categories", { categories: data });
    })
    // Error Handling
    .catch((err) => {
      res.render("categories", { message: "no results" });
    })
  });



//404 handling
app.use((req, res) => {
  res.status(404).render("404");
})  
//setup http server to listen on HTTP_PORT
//include an error in case it doent start
data.initialize().then(function(){
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err){
    console.log("Unable to start: " + err);
})
