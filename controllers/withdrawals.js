const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createError } = require("../error");

//initiate a withdrawal
const initiatewithdrawal = async (req, res, next) => {
  const userid = req.user.id;
  const amount = req.body.amount;
  try {
    const withdrawalRequest = await prisma.withdrawals.create({
      data: {
        ...req.body,
        userid,
        amount,
      },
    });
    res.status(201).json(withdrawalRequest);
  } catch (error) {
    next(err);
  }
};

//complete a withdrawal
const completewithdrawal = async (req, res, next) => {
  const userid = req.user.id;
  const checkuser = await prisma.user.findUnique({
    where: {
      id: userid,
    },
  });
  const user = req.body.id;
  if (checkuser.isAdmin) {
    try {
      const updateduser = await prisma.user.update({
        where: {
          id: user,
        },
        data: {
          balance: {
            decrement: req.body.amount,
          },
          ...req.body,
        },
      });
      const response = await prisma.withdrawals.update({
        where: {
          id: req.params.id,
        },
        data: {
          ...req.body,
        },
      });
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
    const withdrawal = await prisma.withdrawals.findUnique({
      where: { id: req.params.id },
    });
    res.status(200).json(withdrawal);
  } catch (err) {
    next(err);
  }
};

//get a withdrawal by user
const getwithdrawalsbyuser = async (req, res, next) => {
  try {
    const withdrawals = await prisma.withdrawals.findMany({
      where: {
        userid: req.params.id,
      },
    });
    res.status(200).json(withdrawals);
  } catch (err) {
    next(err);
  }
};
//get all deposits
const getallwithdrawals = async (req, res, next) => {
  try {
    const response = await prisma.withdrawals.findMany();
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
