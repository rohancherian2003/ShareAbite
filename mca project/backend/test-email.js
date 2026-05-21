require("dotenv").config();
const { sendEmail } = require("./utils/emailer");

(async () => {
  console.log("Sending test email...");
  await sendEmail("rohancherian2024@gmail.com", "Test", "Test body");
  console.log("Done");
})();
