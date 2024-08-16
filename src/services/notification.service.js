const { getMessaging } = require("firebase-admin/messaging");

const sendNotification = (message) => {
  getMessaging()
    .send(message)
    .then((res) => {
      console.log("send message");
    })
    .catch((err) => console.log("error sending: ", err));
};

module.exports = { sendNotification };
