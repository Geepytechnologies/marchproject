const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
require("dotenv").config();
const authRoute = require("./routes/auth");
const packagesRoute = require("./routes/packages");
const withdrawalsRoute = require("./routes/withdrawals");
const depositsRoute = require("./routes/deposits");
const purchasesRoute = require("./routes/purchases");
const userRoute = require("./routes/users");
const refreshTokenRoute = require("./routes/refreshToken");
const { handleRefreshToken } = require("./controllers/refreshToken");
const { verifyToken } = require("./verifytoken");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const prisma = new PrismaClient({ log: ["query"] });

async function createUser() {
  const newUser = await prisma.user.create({
    data: {
      firstname: "John",
      lastname: "Doe",
      email: "johndoe@example.com",
      phone: "1234567890",
      verified: true,
      password: "password123",
      referralid: "ABCD1234",
      referral1: [],
      referral2: [],
      referral3: [],
      referrer1: "",
      referrer2: "",
      referrer3: "",
      balance: 0,
      referralbonus1: 0,
      referralbonus2: 0,
      referralbonus3: 0,
      isAdmin: false,
      lastincometime: new Date(),
      currentpackage: {
        create: {
          id: "package123",
          usage: 0,
        },
      },
      currentspecialpackage: {
        create: [
          {
            id: "specialpackage1",
            earned: true,
            index: 1,
            price: 100,
            period: 30,
            totalprice: 100,
            datepurchased: new Date(),
          },
        ],
      },
      currentpackageusage: 0,
    },
  });
  //   console.log(newUser);
}

// createUser()
//   .catch((error) => {
//     console.error(error);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// const getUsers = async () => {
//   const users = await prisma.user.findMany();
//   console.log(users);
// };
// getUsers();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // enable cookies and other credentials
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/packages", packagesRoute);
app.use("/api/withdrawals", withdrawalsRoute);
app.use("/api/deposits", depositsRoute);
app.use("/api/purchases", purchasesRoute);
app.use("/api/users", userRoute);
app.use("/api/refresh", refreshTokenRoute);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Richgift196897",
  database: "investment",
});

app.get("/", (req, res) => {
  handleRefreshToken();
  res.status(200);
});
async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}
app.get("/users", verifyToken, (req, res) => {
  getUsers().then((myusers) => {
    res.status(200).json(myusers);
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Backend server is Running");
});
