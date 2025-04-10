const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const os = require("os");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

var pty = require("node-pty");
var shell = os.platform() === "win32" ? "powershell.exe" : "bash";

var ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env,
});

app.use(express.json());
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

ptyProcess.on("data", (data) => {
  io.emit("terminal:output", data);
});

ptyProcess.on("error", (error) => {
  console.error("PTY Error:", error);
  io.emit("terminal:error", error.message);
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/files", async (req, res) => {
  const fileTree = await generateFileTree("./");
  res.json({ tree: fileTree });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function generateFileTree(directory) {
  const tree = {};
  await buildTree(directory, tree);

  return tree;
}

async function buildTree(currentDirectory, currentTree) {
  try {
    const files = await fs.promises.readdir(currentDirectory);

    for (const file of files) {
      const filepath = path.join(currentDirectory, file);
      const stat = await fs.promises.stat(filepath);

      if (stat.isDirectory()) {
        currentTree[file] = {};
        await buildTree(filepath, currentTree[file]);
      } else {
        currentTree[file] = null;
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }
}
