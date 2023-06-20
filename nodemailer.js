const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.dcryptgirl.net",
  port: 465,
  secure: true,
  auth: {
    user: "admin@dcryptgirl.net",
    pass: "Richgift196897",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const mailOptions = {
  from: "admin@dcryptgirl.net",
  to: "geepytechnologies@gmail.com",
  subject: "Complete Your Registration",
  html: `<html>
  <head>
    <meta charset="UTF-8">
    <title>My HTML Email</title>
  </head>
  <body>
    <div>
      <div class="header" style="background-color: teal;">
        <div class="headertext" style="color: white; font-weight: 600; font-size: 25px;">This is Geepy</div>
      </div>
    </div>
  </body>
</html>
  `,
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
  }
});

module.exports = transporter;
