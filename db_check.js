const mongoose = require("mongoose");
require("dotenv").config();
const UserNotification = require("./app/user_notifications/user_notification.model");

const checkDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const notifs = await UserNotification.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    notifs.forEach((n, i) => {
      console.log(
        `Notif ${i}: id=${n._id}, title=${n.title}, readByCount=${n.readBy.length}, readBy=${JSON.stringify(n.readBy)}`,
      );
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkDB();
