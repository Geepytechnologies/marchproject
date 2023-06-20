const { createError } = require("../error");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//initiate a purchase
const purchase = async (req, res, next) => {
  const userid = req.user.id;
  const amount = req.body.amount;
  try {
    const debituser = await prisma.user.update({
      where: { id: userid },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
    const purchaseRequest = await prisma.purchases.create({
      data: { ...req.body, userid, amount },
    });
    res.status(201).json({ purchaseRequest, debituser });
  } catch (err) {
    next(err);
  }
};

//get purchase
const getpurchase = async (req, res, next) => {
  try {
    const purchase = await prisma.purchases.findUnique({
      where: { id: req.params.id },
    });
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
};
//get a purchase by a user
const getuserpurchases = async (req, res, next) => {
  try {
    const purchase = await prisma.purchases.findMany({
      where: { userid: req.params.id },
    });
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
};
//get all purchases
const getallpurchases = async (req, res, next) => {
  try {
    const response = await prisma.purchases.findMany();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
module.exports = {
  purchase,
  getpurchase,
  getuserpurchases,
  getallpurchases,
};
