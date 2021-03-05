const nodemalier = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodemalier.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });
  const mailOption = {
    from: "The School App <TSA@negentchnologies.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
    //html:
  };
  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
