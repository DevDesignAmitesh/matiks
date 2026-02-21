import express from "express";
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("good hai");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.listen(4000, () => {
  console.log("server is running at 4000");
});
