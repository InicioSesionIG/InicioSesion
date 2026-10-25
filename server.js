
const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.WebSocketServer({
  server,
  path: "/ws"
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/monitor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "monitor.html"));
});

wss.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type !== "demo-command") return;
      if (typeof msg.alias !== "string") return;
      if (typeof msg.text !== "string") return;

      const response = JSON.stringify({
        type: "demo-command",
        alias: msg.alias.trim().slice(0, 40),
        text: msg.text.trim().slice(0, 200),
        time: new Date().toLocaleTimeString()
      });

      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(response);
        }
      }

      console.log(
        "Alias:", msg.alias,
        "| Mensaje:", msg.text
      );
    } catch (error) {
      console.error("Error al procesar el mensaje");
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor iniciado en el puerto " + PORT);
});
