const express = require("express");
const { createBareServer } = require("@tomphttp/bare-server-node");
const path = require("path");
const http = require("http");

const app = express();
const bareServer = createBareServer("/bare/");

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Serve your proxy-site.html as the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "proxy-site.html"));
});

const server = http.createServer((req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
