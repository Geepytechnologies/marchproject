const { createError } = require("../error");

//initiate a withdrawal
const initiatewithdrawal = async (req, res, next) => {
  const userid = req.user.id;
  const amount = req.body.amount;
  const withdrawalRequest = new Withdrawals({ ...req.body, userid, amount });
  try {
    const data = await withdrawalRequest.save();
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

//complete a withdrawal
const completewithdrawal = async (req, res, next) => {
  const userid = req.user.id;
  const checkuser = await User.findById(userid);
  const user = req.body.id;
  if (checkuser.isAdmin) {
    try {
      const updateduser = await User.findByIdAndUpdate(
        user,
        {
          $inc: { balance: -req.body.amount },
          $set: req.body,
        },
        { new: true }
      );
      const response = await Withdrawals.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json({ updateduser, response });
    } catch (err) {
      next(err);
    }
  } else {
    next(createError(401, "You are not an Admin"));
  }
};
//get withdrawal
const getwithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawals.findById(req.params.id);
    res.status(200).json(withdrawal);
  } catch (err) {
    next(err);
  }
};

//get a withdrawal by user
const getwithdrawalsbyuser = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawals.find({ userid: req.params.id });
    res.status(200).json(withdrawal);
  } catch (err) {
    next(err);
  }
};
//get all deposits
const getallwithdrawals = async (req, res, next) => {
  try {
    const response = await Withdrawals.find();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
module.exports = {
  initiatewithdrawal,
  getwithdrawalsbyuser,
  completewithdrawal,
  getwithdrawal,
  getallwithdrawals,
};
