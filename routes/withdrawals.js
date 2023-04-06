const express = require('express')
const router = express.Router();
const {initiatewithdrawal,getwithdrawalsbyuser, completewithdrawal, getwithdrawal, getallwithdrawals} = require('../controllers/withdrawals');
const {verifyToken} = require('../verifytoken');

router.post("/", verifyToken, initiatewithdrawal);
router.put("/:id", verifyToken, completewithdrawal);
//get a withdrawal
router.get("/find/:id", getwithdrawal)

//get withdrawals by user
router.get("/find/user/:id", getwithdrawalsbyuser)


//get all users
router.get("/find", getallwithdrawals)


module.exports = router;