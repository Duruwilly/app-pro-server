let usersMessages = [];
// add the user to usersMessages array when a user has not been added or a new user connect or login from the frontend
export const addNewUsers = (userID, socketId) => {
  if (!usersMessages.some((user) => user.userID === userID)) {
    usersMessages.push({
      userID,
      socketId,
      online: true,
    });
  }
};

// remove the user from the array when the user disconnect or logout from the frontend
export const removeUser = (socketId) => {
  usersMessages = usersMessages.filter((user) => user.socketId !== socketId);
};

// this get a particular user and return that user
export const getUser = (userID) => {
  //   console.log(usersMessages);
  return usersMessages.find((user) => user.userID === userID);
};
