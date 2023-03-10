let onlineUsers = [];

export const newConnectionHandler = (newClient) => {
  console.log("NEW CONNECTION:", newClient.id);

  // 1. Emit a "welcome" event to the connected client
  newClient.emit("welcome", { message: `Hello ${newClient.id}` });

  // 2. Listen to an event emitted by the FE called "setUsername", this event is going to contain the username in the payload
  newClient.on("setUsername", (payload) => {
    console.log(payload);
    // 2.1 Whenever we receive the username, we keep track of that together with the socket.id
    onlineUsers.push({ username: payload.username, socketId: newClient.id });

    // 2.2 Then we have to send the list of online users to the current user that just logged in
    newClient.emit("loggedIn", onlineUsers);

    // 2.3 We have also to inform everybody (but not the sender) of the new user which just joined
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });

  // 3. Listen to "sendMessage" event, this is received when an user sends a new message
  newClient.on("sendMessage", (message) => {
    console.log("NEW MESSAGE:", message);
    // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
    newClient.broadcast.emit("newMessage", message);
  });
  newClient.on("typingStatus", (status) => {
    console.log("NEW STATUS:", status);
    // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
    newClient.broadcast.emit("isTyping", status);
  });

  // 4. Listen to an event called "disconnect", this is NOT a custom event!! This event happens when an user closes browser/tab
  newClient.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
