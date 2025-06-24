const express = require("express");
const router = express.Router();
const { saveInstagramUser, saveVisitorData, getInstagramUser } = require("../controllers/instagram-controllers");

router.post("/save", saveInstagramUser);
router.post("/visitor", saveVisitorData);
router.get("/user/:username", getInstagramUser);


module.exports = router;