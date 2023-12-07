let usersNotification = [];
// add the user to usersNotification array when a new user connect or login from the frontend
export const addNewUsers = (userID, pushToken, socketId) => {
  console.log("addNewUsersUtil", userID, socketId, pushToken.toString());
  if (!usersNotification.some((user) => user.userID === userID)) {
    usersNotification.push({ userID, pushToken, socketId, online: true });
  }
  console.log("[]", usersNotification);
};

// remove the user from the array when the user disconnect or logout from the frontend
export const removeUser = (socketId) => {
  usersNotification = usersNotification.filter(
    (user) => user.socketId !== socketId
  );
};

// this get a particular user and return that user
export const getUser = (userID) => {
  //   console.log(usersNotification);
  return usersNotification.find((user) => user.userID === userID);
};
