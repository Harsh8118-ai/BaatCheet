const express = require("express");
const router = express.Router();
const { saveInstagramUser, saveVisitorData } = require("../controllers/instagram-controllers");

router.post("/save", saveInstagramUser);
router.post("/visitor", saveVisitorData);

module.exports = router;