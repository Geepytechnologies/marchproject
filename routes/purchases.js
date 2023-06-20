const express = require("express");
const router = express.Router();
const {
  purchase,
  getallpurchases,
  getuserpurchases,
  getpurchase,
} = require("../controllers/purchases");
const { verifyToken } = require("../verifytoken");

router.post("/", verifyToken, purchase);
//get a deposit
router.get("/find/:id", getpurchase);

//get all deposits
router.get("/find/user/:id", getuserpurchases);

//get all deposits
router.get("/find", getallpurchases);

module.exports = router;
