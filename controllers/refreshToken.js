const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.sendStatus(401);
  const refreshToken = cookies.token;

  const foundUser = await prisma.user.findUnique({
    where: {
      refreshtoken: refreshToken,
    },
  });
  if (!foundUser) {
    res.status(403).json("User not Found");
  }
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err || foundUser?.id !== user.id) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.ACCESS_SECRET,
      { expiresIn: "60s" }
    );
    const { password, ...others } = foundUser;
    res.json({ accessToken, others });
  });
};

module.exports = { handleRefreshToken };
