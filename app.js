//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-yuvasree:65HariYuvi74@cluster0.zabaa.mongodb.net/todolistdb",{useNewUrlParser:true});


//mongooseschema

const itemSchema = new mongoose.Schema({
  name: String,
  
});



//model
const Item = mongoose.model("Item",itemSchema);




//inserting items
const item1= new Item({
  name:"Welcome to todolist"
});
const item2= new Item({
  name:"Hit + to add an item"
});
const item3= new Item({
  name:"<== Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
  
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  const day = date.getDate();

  Item.find(function(err,items){

    if(items.length === 0)
    {
      Item.insertMany([item1,item2,item3],function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully inserted");
        }
      });

      res.redirect("/");

    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: items});

    }
    
    
  });



  

});

app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList)
  {
    if(!err)
    {
      if(!foundList)
      {
        const list = new List ({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);

      }
      else
      {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item4 = new Item({
    name : itemName
  });
  if(listName === "Today")
  {
    item4.save();
    res.redirect("/");

  }
  else
  {
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  

  
});


app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.deleteOne({_id:checkedItemId},function(err){
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("Successfully deleted!");
       
      }
    });
    res.redirect("/");

  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull : {items:{_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/" + listName);
      }
    });
  }

 

});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
