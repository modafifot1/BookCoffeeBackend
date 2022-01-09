var Socket = require("socket.io");
export class MySocket {
  constructor(server) {
    MySocket.prototype.socket = Socket(server.getServer(), {
      cors: {
        origin: "*",
      },
    });
  }
}
MySocket.prototype.getInstance = () => {
  return MySocket.prototype.socket;
};
