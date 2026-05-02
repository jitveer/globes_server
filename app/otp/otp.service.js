const OTP = require("./otp.model");

/**
 * Generate a 6-digit random OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via MSG91 SMS
 */
const sendSMSOTP = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTHKEY;
  const templateId = process.env.MSG91_TEMPLATE;

  if (!authKey || !templateId || authKey === "your_msg91_authkey") {
    console.warn("--- MSG91 Credentials Missing or Placeholder ---");
    console.warn(`TESTING MODE: OTP for ${phone} is: ${otp}`);
    return true;
  }

  try {
    // Format mobile number: remove all non-digits
    let mobile = phone.replace(/\D/g, "");
    // If it's 10 digits, assume India (91)
    if (mobile.length === 10) {
      mobile = "91" + mobile;
    }

    console.log(`Attempting to send OTP ${otp} to ${mobile}...`);

    // MSG91 v5 OTP API Call
    const response = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: mobile,
        otp: otp,
        otp_expiry: 10, // 10 minutes
        realTimeResponse: 1,
      }),
    });

    const data = await response.json();
    console.log("MSG91 Response Data:", JSON.stringify(data));

    if (data.type === "success") {
      console.log(`✅ OTP successfully sent to ${mobile}`);
      return true;
    } else {
      console.error("❌ MSG91 Failed:", data.message || JSON.stringify(data));
      return false;
    }
  } catch (error) {
    console.error("❌ MSG91 Request Error:", error.message);
    return false;
  }
};

/**
 * Main function to send OTP
 */
exports.sendOTP = async (recipient, type) => {
  const otp = generateOTP();

  // Save OTP to DB with 10 mins expiry
  await OTP.findOneAndUpdate(
    { recipient },
    {
      otp,
      type: "phone", // Forced to phone as per user request
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    { upsert: true, new: true },
  );

  // Send via SMS only
  return await sendSMSOTP(recipient, otp);
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (recipient, otp) => {
  const otpRecord = await OTP.findOne({ recipient, otp, verified: false });

  if (!otpRecord) return false;

  // Check expiry
  if (otpRecord.expiresAt < new Date()) return false;

  otpRecord.verified = true;
  await otpRecord.save();
  return true;
};
