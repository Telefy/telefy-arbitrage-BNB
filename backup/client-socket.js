const io = require("socket.io-client");

const socket = io("ws://localhost:3000", {
    reconnectionDelayMax: 10000,
    auth: {
      token: "123"
    },
    query: {
      "my-key": "my-value"
    }
  });

  
  socket.emit("0xcd6bcca48069f8588780dfa274960f15685aee0e",{});
//   socket.emit("0x06da0fd433c1a5d7a4faa01111c044910a184553",{});
//   socket.emit('client-info', { "socket_id": "o9", "type": "exchange" });
//   socket.on("getPairs", function(msg){
//       console.log(msg,"----parissssss----")
//   })