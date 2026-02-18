import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

server.on("connection", (ws) => {
  console.log("connected");

  ws.on("error", (err) => console.error(err));

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());

    console.log("recevied data ", parsedData);
  });

  ws.on("close", () => {
    console.log("left");
  });
});
