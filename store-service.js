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

//add a new item
module.exports.addItem = function(itemData){
    return new Promise((resolve, reject) => {
        if (itemData.published === undefined) {
            itemData.published = false;
        } else {
            itemData.published = true;
        }
    
        // Setting the next item id
        itemData.id = items.length + 1;
    
        // Adding to items
        items.push(itemData);
        resolve(itemData);
    })
    
};



//items by category function
module.exports.getItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);

        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    })
}

//postDate property represents a Date value that is greater than,
//or equal to the minDateStr 
module.exports.getItemsByMinDate = function(minDateStr){
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));

        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    })
} 

//find items with ID
module.exports.getItemById = function (id) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.id == id);
        const uniqueItem = filteredItems[0];

        if (uniqueItem) {
            resolve(uniqueItem);
        }
        else {
            reject("no result returned");
        }
    })
}

//produces items that are both published and filtered by Category
module.exports.getPublishedItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category && item.published === true);

        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    })
}