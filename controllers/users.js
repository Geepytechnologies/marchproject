const { createError } = require("../error.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// const update = async (req, res, next) => {
//   if (req.params.id === req.user.id || req.user.isAdmin === true) {
//     const amount = req.body.amount;
//     try {
//       const updatedUser = await User.findByIdAndUpdate(
//         req.params.id,
//         {
//           $inc: { balance: amount },
//           $push: {
//             currentpackage: req.body.currentpackage,
//           },
//           $set: req.body,
//         },
//         { new: true }
//       );
//       res.status(200).json(updatedUser);
//     } catch (err) {
//       next(err);
//     }
//   } else {
//     return next(createError(403, "Unauthorized"));
//   }
// };
const update = async (req, res, next) => {
  if (req.params.id === req.user.id || req.user.isAdmin === true) {
    const amount = req.body.amount;
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: req.params.id,
        },
        data: {
          balance: {
            increment: amount,
          },
          currentpackage: {
            push: req.body.currentpackage,
          },
          ...req.body,
        },
        include: {
          currentpackage: true,
        },
      });
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "Unauthorized"));
  }
};
// const updateforspecialpackage = async (req, res, next) => {
//   if (req.params.id === req.user.id || req.user.isAdmin === true) {
//     const amount = req.body.amount;
//     try {
//       const updatedUser = await User.findByIdAndUpdate(
//         req.params.id,
//         {
//           $inc: { balance: amount },
//           $push: {
//             currentspecialpackage: [
//               {
//                 id: req.body.id,
//                 earned: req.body.earned,
//                 index: req.body.index,
//                 price: req.body.price,
//                 period: req.body.period,
//                 totalprice: req.body.totalprice,
//                 datepurchased: req.body.datepurchased,
//               },
//             ],
//           },
//           // $set: req.body,
//         },
//         { new: true }
//       );
//       res.status(200).json(updatedUser);
//     } catch (err) {
//       next(err);
//     }
//   } else {
//     return next(createError(403, "Unauthorized"));
//   }
// };
const updateforspecialpackage = async (req, res, next) => {
  if (req.params.id === req.user.id || req.user.isAdmin === true) {
    const amount = req.body.amount;
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: req.params.id,
        },
        data: {
          balance: {
            increment: amount,
          },
          currentspecialpackage: {
            push: {
              id: req.body.id,
              earned: req.body.earned,
              index: req.body.index,
              price: req.body.price,
              period: req.body.period,
              totalprice: req.body.totalprice,
              datepurchased: req.body.datepurchased,
            },
          },
        },
        include: {
          currentspecialpackage: true,
        },
      });
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "Unauthorized"));
  }
};
// const updatespecialearned = async (req, res, next) => {
//   if (req.params.id === req.user.id) {
//     try {
//       const updatedUser = await User.findByIdAndUpdate(req.params.id);
//       updatedUser.currentspecialpackage.forEach((item) => {
//         const purchasedate = item.datepurchased;
//         // const periodinmilliseconds = 3 * 60 * 1000;
//         const periodinmilliseconds = item.period * 24 * 60 * 60 * 1000;
//         const lastupdatedtime = new Date(purchasedate).getTime();
//         const now = new Date().getTime();
//         const timediff = now - lastupdatedtime;
//         const updateTime = Math.trunc(timediff / periodinmilliseconds);
//         if (updateTime >= 1 && item.earned === false) {
//           item.earned = true;
//           updatedUser.balance += item.totalprice;
//         }
//         // console.log({
//         //   period: periodinmilliseconds,
//         //   itemp: item.period,
//         //   earned: item.earned,
//         //   updatet: updateTime,
//         //   lastup: lastupdatedtime,
//         //   timediff: timediff,
//         //   purchasedate: purchasedate,
//         // });
//       });
//       updatedUser.save();
//       res.status(200).json(updatedUser);
//     } catch (err) {
//       res.status(403);
//     }
//   } else {
//     return next(createError(403, "Unauthorized"));
//   }
// };
const updatespecialearned = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: req.params.id,
        },
        include: {
          currentspecialpackage: true,
        },
      });

      updatedUser.currentspecialpackage.forEach((item) => {
        const purchasedate = item.datepurchased;
        const periodinmilliseconds = item.period * 24 * 60 * 60 * 1000;
        const lastupdatedtime = new Date(purchasedate).getTime();
        const now = new Date().getTime();
        const timediff = now - lastupdatedtime;
        const updateTime = Math.trunc(timediff / periodinmilliseconds);
        if (updateTime >= 1 && item.earned === false) {
          item.earned = true;
          updatedUser.balance += item.totalprice;
        }
      });

      await prisma.user.update({
        where: {
          id: req.params.id,
        },
        data: {
          currentspecialpackage: {
            updateMany: updatedUser.currentspecialpackage,
          },
          balance: updatedUser.balance,
        },
      });

      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(403).send();
    }
  } else {
    return next(createError(403, "Unauthorized"));
  }
};

const updatereferral = async (req, res, next) => {
  // if(req.params.id === req.user.id){
  const ref1 = req.body.referral1;
  const ref2 = req.body.referral2;
  const ref3 = req.body.referral3;
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        referral1: {
          push: ref1,
        },
        referral2: {
          push: ref2,
        },
        referral3: {
          push: ref3,
        },
      },
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

const updatereferralbonus = async (req, res, next) => {
  const amount1 = req.body.referralbonus1;
  const amount2 = req.body.referralbonus2;
  const amount3 = req.body.referralbonus3;
  const amount = req.body.amount;
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        referralbonus1: {
          increment: amount1,
        },
        referralbonus2: {
          increment: amount2,
        },
        referralbonus3: {
          increment: amount3,
        },
        balance: {
          increment: amount,
        },
      },
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const findUser = async (query) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { firstname: query.firstname },
        { lastname: query.lastname },
        { email: query.email },
        { referralid: query.refid },
      ],
    },
  });
  return user;
};

const getUserByProp = async (req, res) => {
  const query = req.body;
  const user = await findUser(query);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};
const deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json("user has been deleted");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  update,
  updatereferral,
  updatereferralbonus,
  getUserById,
  getAllUsers,
  getUserByProp,
  deleteUser,
  updateforspecialpackage,
  updatespecialearned,
};
