const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("REPLACE_WITH_YOUR_MONGODB_CONNECTION_URL");

const itemSchema = ({
    name: String
});

const Item = mongoose.model("Item", itemSchema);


const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema)


app.get("/", (req, res) => {
    Item.find({}, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: results
            });
        }
    });
});

app.post("/", (req, res) => {

    const item = req.body.newItem;
    const listName = req.body.list;

    let newItem = new Item({
        name: item
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();

        })
        res.redirect("/" + listName);
    }

});

app.post("/delete", (req, res) => {
    const itemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.deleteOne({
            _id: itemID
        }, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully Deleted");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: itemID
                }
            }
        }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }
});

app.get("/:customListName", (req, res) => {

    const customListName = req.params.customListName.charAt(0).toUpperCase() + req.params.customListName.slice(1);

    List.findOne({
        name: customListName
    }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: []
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list.ejs", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });

});

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, () => {
    console.log("Server started successfully.");
});