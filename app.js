//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ankur:ankur123@cluster0-rxcv2.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = {
  name:String                                                 //schema
};
const Item=mongoose.model("Item",itemsSchema);                     //model
const item1=new Item ({
  name:"Welcome to your todolist!"
});
const item2=new Item ({
  name:"Hit the + button to add a new item."
});
const item3=new Item ({
  name:"<-- Hit this to delete an item."
});
const defaultItems = [item1, item2 ,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];        //delete this because we use mongoose for databae
// const workItems = [];

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("The insertion has successfully done.");              //insertion method
        }
      });
      res.redirect("/");
    }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });
// const day = date.getDate();                                    //we are ignoring this external module of genarating the date in date.js to decrease the complexity of this website
// res.render("list", {listTitle: day, newListItems: items});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
// item.save();
// res.redirect("/");
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
app.post("/delete",function(req,res){
  const checkedItemId =req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Deleted successfully");
        res.redirect("/");

      }
    });
  }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);

        }
      });
  }

});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name: customListName,
          items: defaultItems
        });
        list.save();  //Create a new list
        res.redirect("/"+customListName);
      }else{
      res.render("list",{listTitle:foundList.name, newListItems: foundList.items});  //Show an existing lists
      }
    }

  });

});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
