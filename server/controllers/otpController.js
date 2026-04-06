const generateOTP = require("../utils/generateOTP");
const transporter = require("../config/mail");
const jwt = require("jsonwebtoken");

const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const OTP_TOKEN_SECRET = process.env.OTP_TOKEN_SECRET || "dev_otp_secret_change_me";

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!gmailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Only Gmail format is accepted" });
    }

    const otp = generateOTP();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP number is ${otp}.\n\nPlease do not share with any body.\nThank you for request`,
      html: `<p>Your OTP number is <strong>${otp}</strong>.</p><p>Please do not share with any body.<br/>Thank you for request</p>`,
    });

    const otpToken = jwt.sign({ email, otp }, OTP_TOKEN_SECRET, {
      expiresIn: "5m",
    });

    return res.json({ message: "OTP Sent", otpToken });
  } catch (error) {
    console.error("OTP send error:", error.message);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

exports.verifyOTP = (req, res) => {
  const { email, otp, otpToken } = req.body;

  if (!email || !otp || !otpToken) {
    return res
      .status(400)
      .json({ message: "Email, OTP and token are required" });
  }

  if (!gmailRegex.test(email)) {
    return res.status(400).json({ message: "Only Gmail format is accepted" });
  }

  try {
    const payload = jwt.verify(otpToken, OTP_TOKEN_SECRET);

    if (payload.email !== email) {
      return res.status(400).json({ message: "Invalid token email" });
    }

    if (payload.otp === otp) {
      return res.json({ message: "Verified Successfully" });
    }

    return res.status(400).json({ message: "Invalid OTP" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "OTP Expired" });
    }

    return res.status(400).json({ message: "Invalid OTP token" });
  }
};
