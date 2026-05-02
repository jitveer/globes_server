const otpService = require("./otp.service");

exports.sendOtp = async (req, res) => {
  try {
    const { recipient, type } = req.body;

    if (!recipient || !type) {
      return res.status(400).json({
        success: false,
        message: "Recipient and type are required.",
      });
    }

    const sent = await otpService.sendOTP(recipient, type);

    if (sent) {
      return res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${recipient}.`,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { recipient, otp } = req.body;

    if (!recipient || !otp) {
      return res.status(400).json({
        success: false,
        message: "Recipient and OTP are required.",
      });
    }

    const verified = await otpService.verifyOTP(recipient, otp);

    if (verified) {
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
