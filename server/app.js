const express = require("express");
const cors = require("cors");
const transporter = require("./config/mail");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/otpRoutes"));

app.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "samizaman987@gmail.com",
      subject: "Test Mail",
      text: "Gmail Connected Successfully",
    });

    return res.send("Mail Sent");
  } catch (error) {
    console.error("Test mail error:", error.message);
    return res.status(500).send(`Mail failed: ${error.message}`);
  }
});

module.exports = app;
