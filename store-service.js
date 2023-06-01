const fs = require('fs');  
var path = require("path");   
var items = [];
var categories = [];

//open files, read data and save them in the two global arrays
//we use promises cause we dont know the file sizes
module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "data", "items.json"), (err, data) => {
            if (err) {              
              reject("Unable to read items file");
            }

            // Save items
            items = JSON.parse(data);

            
            fs.readFile(path.join(__dirname, "data", "categories.json"), (err, data) => {
                if (err) {
                    // Error Handling
                  reject("Unable to read categories file");
                }

                // Save categories
                categories = JSON.parse(data);

                resolve();
              });
          });
    })
}

//get all the items from the array items
module.exports.getAllItemss = function() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject("No results returned");
        } else {
            resolve(items);
        }
    })
}

//array of items with published is true
module.exports.getPublishedItems = function(){
    return new Promise((resolve, reject) => {
        let publishedItems = [];
        items.forEach((items) => {
            if (items.published === true) {
                publishedItems.push(items);
            }
        })

        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No results returned");
        }
    })    
}

// full array of categories
module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("No results returned");
        } else {
            resolve(categories);
        }
    })
}