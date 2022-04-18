const http = require("http");
const mongoose = require("mongoose");
const Post = require("./models/post");
const statusHandle = require("./statusHandle");
require("dotenv").config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// 連線資料庫
mongoose
  .connect(DB)
  .then(() => console.log("資料庫連線成功"))
  .catch((err) => console.log(err));

const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Length, X-Requested-With", // headers 允許哪些資訊
  "Access-Control-Allow-Origin": "*", // 允許其他IP造訪
  "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE", // 支援的方法
  "Content-Type": "application/json",
};

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  if (req.url === "/posts" && req.method === "GET") {
    const data = await Post.find();
    statusHandle(res, 200, headers, data);
  } else if (req.url === "/posts" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = await Post.create(JSON.parse(body));
        statusHandle(res, 200, headers, data);
      } catch (err) {
        statusHandle(res, 404, headers, [], "格式錯誤");
      }
    });
  } else if (req.url === "/posts" && req.method === "DELETE") {
    await Post.deleteMany({});
    statusHandle(res, 200, headers, []);
  } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();
    try {
      await Post.findByIdAndDelete(id);
      statusHandle(res, 200, headers, null);
    } catch (err) {
      statusHandle(res, 404, headers, [], err);
    }
  } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const id = req.url.split("/").pop();
        const data = await Post.findByIdAndUpdate(id, JSON.parse(body));
        statusHandle(res, 200, headers, data);
      } catch (err) {
        statusHandle(res, 404, headers, [], err);
      }
    });
  } else if (req.method === "OPTION") {
    res.writeHead(200, headers);
    res.end();
  } else {
    statusHandle(res, 400, headers, [], "路由錯誤");
  }
};

const server = http.createServer(requestListener);

server.listen(process.env.PORT || 3005);
