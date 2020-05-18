//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<user>:<Password>@cluster0-toai1.mongodb.net/todolistDB",  {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema ({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const Item1 = new Item ({
  name: "Welcome to your todolist"
});
const Item2 = new Item ({
  name: "Hit the + button to add a new item."
});
const Item3 = new Item ({
  name:"<-- Hit  this to delete an Item."
});
const defaulItems = [Item1, Item2, Item3];

const listSchema = new mongoose.Schema ({
  name: String,
  items:[itemsSchema]
});
const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {

Item.find({}, function(err, results){
  if(results.length === 0){
    Item.insertMany(defaulItems, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Successfully updated the document");
      }
    })
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: results});
  }

})

});
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name:customListName},function(err, foundList){
    if(!err){
      if (!foundList){
        //Create New List
        const list = new List ({
          name: customListName,
          items: defaulItems
        });
        list.save();
        res.redirect("/" + customListName)
      } else {
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })

  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted the document");
      }
    });
    res.redirect("/");
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err) {
          res.redirect("/" + listName);
        } else {
          console.log(err);
        }
      });
    }
})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
