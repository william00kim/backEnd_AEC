const express = require("express")
const router = express.Router();

const output = {
    home : (req, res) => {
        res.render("home/index");
    },
    login : (req, res) => {
        res.render("home/login");
    }
}

router.get("/Master", render("../Master.js"))