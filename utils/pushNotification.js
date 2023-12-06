export const sendPushNotification = async (parameters) => {
  console.log(parameters);
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameters),
    });
  } catch (error) {
    throw error;
  }
};
