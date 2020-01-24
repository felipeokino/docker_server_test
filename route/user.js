const express = require("express");

// Instance of Router
const route = express.Router();

//Importing controllers
const {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne
} = require("../controllers/user");

route.get("/", getAll)
route.get("/:id", getOne)
route.get("/:id", createOne)
route.get("/:id", updateOne)
route.get("/:id", deleteOne)