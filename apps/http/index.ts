import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("good hai");
});

app.listen(4000, () => {
  console.log("server is running at 4000");
});
