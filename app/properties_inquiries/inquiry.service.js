const Inquiry = require("./inquiry.model");
const nodemailer = require("nodemailer");
const { createAdminNotification } = require("../notifications/admin_notification.service");

// Simple Transporter setup for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Service to handle OTP generation and sending
 */
exports.generateAndSendOTP = async (inquiryData) => {
  // 1. Generate a 6-digit random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

  // 2. Look for an existing unverified inquiry for this email
  let inquiry = await Inquiry.findOne({
    email: inquiryData.email,
    isVerified: false,
  });

  if (inquiry) {
    // Update existing unverified inquiry with new data and OTP
    inquiry.name = inquiryData.name;
    inquiry.phone = inquiryData.phone;
    inquiry.message = inquiryData.message;
    inquiry.otp = otp;
    inquiry.otpExpires = otpExpires;
  } else {
    // Create a new inquiry record
    inquiry = new Inquiry({
      ...inquiryData,
      otp,
      otpExpires,
    });
  }

  await inquiry.save();

  // 3. Send the OTP via Email
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: inquiry.email,
      subject: "Verification OTP - Globes Properties Inquiry",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ea580c;">Inquiry Verification</h2>
          <p>Hello <strong>${inquiry.name}</strong>,</p>
          <p>You have started an inquiry for a property. Please use the following OTP to verify your contact information:</p>
          <div style="font-size: 24px; font-weight: bold; background: #fff7ed; padding: 15px; text-align: center; border-radius: 5px; color: #ea580c; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          <p>Thank you,<br>Globes Properties Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    // In development, we log the OTP so we don't need a working SMTP to test
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV MODE] OTP for ${inquiry.email}: ${otp}`);
    }
  }

  return { success: true, message: "OTP sent successfully" };
};

/**
 * Service to verify OTP and finalize inquiry
 */
exports.verifyAndFinalizeInquiry = async (email, otp) => {
  // Find inquiry that is unverified and has correct OTP which is not expired
  const inquiry = await Inquiry.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
    isVerified: false,
  });

  if (!inquiry) {
    throw new Error("Invalid or expired OTP. Please request a new one.");
  }

  // Mark as verified and clear OTP fields
  inquiry.isVerified = true;
  inquiry.otp = undefined;
  inquiry.otpExpires = undefined;

  await inquiry.save();

  // Send notification to admin
  await createAdminNotification({
    type: "inquiry_received",
    title: "New Property Inquiry",
    message: `${inquiry.name} has inquired about a property.`,
    recipientRole: "admin",
    metadata: {
      inquiryId: inquiry._id,
      propertyId: inquiry.propertyId,
      name: inquiry.name,
      email: inquiry.email,
    },
  });

  return inquiry;
};

/**
 * Service to fetch all verified inquiries
 */
exports.getAllInquiries = async () => {
  return await Inquiry.find({ isVerified: true })
    .populate("propertyId", "title location price images")
    .sort({ createdAt: -1 });
};

/**
 * Service to update inquiry status
 */
exports.updateInquiryStatus = async (id, status) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  ).populate("propertyId", "title");

  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  return inquiry;
};
