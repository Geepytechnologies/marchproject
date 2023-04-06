const { createError } = require("../error");

//Add a package

const addPackage = async (req, res, next) => {
  const newPackage = new Packages({
    price: req.body.price,
    dailyIncome: req.body.dailyIncome,
    totalIncome: req.body.totalIncome,
    limit: req.body.limit,
    index: req.body.index,
  });
  const userid = req.user.id;
  const checkuser = await User.findById(userid);
  if (checkuser.isAdmin) {
    try {
      const savedPackage = await newPackage.save();
      res.status(200).send(savedPackage);
    } catch (err) {
      next(err);
    }
  } else {
    next(createError(401, "You are not an Admin"));
  }
};

//Get a package
const getpackage = async (req, res, next) => {
  try {
    const package = await Packages.findById(req.params.id);
    if (package) {
      res.json(package).status(200);
    } else {
      next(createError(404, "Package not found"));
    }
  } catch (err) {
    next(err);
  }
};

//Get a package
const getpackagebyindex = async (req, res, next) => {
  try {
    const package = await Packages.find({ index: req.params.id });
    if (package) {
      res.json(package).status(200);
    } else {
      next(createError(404, "Package not found"));
    }
  } catch (err) {
    next(err);
  }
};

//update a package
const updatepackage = async (req, res, next) => {
  const userid = req.user.id;
  const checkuser = await User.findById(userid);
  if (checkuser.isAdmin) {
    try {
      const package = await Packages.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(package);
    } catch (err) {
      next(err);
    }
  } else {
    next(createError(401, "You are not an Admin"));
  }
};

//GetallPackages
const getallpackages = async (req, res, next) => {
  try {
    const packages = await Packages.find();
    res.status(200).json(packages);
  } catch (err) {
    next(err);
  }
};

//deletePackage
const deletepackage = async (req, res, next) => {
  const userid = req.user.id;
  const checkuser = await User.findById(userid);
  if (checkuser.isAdmin) {
    try {
      await Packages.findByIdAndDelete(req.params.id);
      res.status(200).json("Package has been deleted");
    } catch (err) {
      next(err);
    }
  } else {
    next(createError(401, "You are not an Admin"));
  }
};

module.exports = {
  addPackage,
  getpackage,
  updatepackage,
  getallpackages,
  deletepackage,
  getpackagebyindex,
};
