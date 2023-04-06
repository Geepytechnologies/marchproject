const { createError } = require("../error");

//initiate a purchase
const initiatepurchase = async (req, res, next) => {
  const userid = req.user.id;
  const amount = req.body.amount;
  const purchaseRequest = new Purchases({ ...req.body, userid, amount });
  try {
    const data = await purchaseRequest.save();
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

//complete a purchase
const completepurchase = async (req, res, next) => {
  const userid = req.user.id;
  const amount = req.body.amount;
  const checkuser = await User.findById(userid);
  const user = req.body.id;
  try {
    //    const updateduser = await User.findByIdAndUpdate(user,{
    //     $inc: {balance: req.body.amount},
    //     $set: req.body,
    //   },{new: true});
    const response = await Purchases.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json("purchase updated");
  } catch (err) {
    next(err);
  }
};
//get purchase
const getpurchase = async (req, res, next) => {
  try {
    const purchase = await Purchases.findById(req.params.id);
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
};
//get a purchase by a user
const getuserpurchases = async (req, res, next) => {
  try {
    const purchase = await Purchases.find({ userid: req.params.id });
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
};
//get all purchases
const getallpurchases = async (req, res, next) => {
  try {
    const response = await Purchases.find();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
module.exports = {
  initiatepurchase,
  getpurchase,
  completepurchase,
  getuserpurchases,
  getallpurchases,
};
