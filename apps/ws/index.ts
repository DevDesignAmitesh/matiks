import { WebSocketServer } from "ws";
import { MESSAGE_TYPE } from "@repo/common/common";
import { verify } from "jsonwebtoken";
import type { WebSocket } from "ws";
import { prisma } from "@repo/db/db";

const server = new WebSocketServer({ port: 8080 });

interface ExtendedWS extends WebSocket {
  userId: string;
}

interface User {
  id: string;
  ws: WebSocket;
  isOnline: boolean;
  wantOnlineUsers: boolean;
  inGame: boolean;
}

interface Question {
  id: string;
  operation: "ADD" | "SUB" | "MUL" | "DIV";
  operand1: number;
  operand2: number;
  answer: number;
  createdAt: Date;
}
// userId and users
const users: Map<string, User> = new Map();

// gameId and users
const games: Map<string, User[]> = new Map();

// gameId and questions
const questions: Map<string, Question[]> = new Map();

// gameId and question index
const questionCounter: Map<string, number> = new Map();

// question Id and answers at
const questionTiming: Map<string, number> = new Map();

const verifyUser = (token: string): { userId: string | null } => {
  try {
    return verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (e) {
    console.log("error while verfying user in jwt ", e);
    return { userId: null };
  }
};

server.on("connection", (ws: ExtendedWS, req) => {
  console.log("connected");

  // we should send token from client like this
  // ws://localhost:8080/?token="TOKEN"
  const token = req.url?.split("?")[1]?.split("=")[1];

  if (!token) {
    ws.close();
    return;
  }

  const user = verifyUser(token);

  if (!user.userId) {
    ws.close();
    return;
  }

  ws.userId = user.userId;

  users.set(user.userId, {
    id: user.userId,
    ws,
    isOnline: true,
    wantOnlineUsers: true,
    inGame: false,
  });

  updateUserOnlineStatus(true, ws.userId);

  sendOnlineUsers(users);

  ws.on("error", (err) => console.error(err));

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());

    console.log("recevied data ", parsedData);

    if (parsedData.type === MESSAGE_TYPE.PING) {
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.PONG,
        }),
      );
    }

    if (
      parsedData.type === MESSAGE_TYPE.FRIEND_REQUEST ||
      parsedData.type === MESSAGE_TYPE.FRIEND_ACCEPT
    ) {
      const { otherUserId } = parsedData.payload;

      const user = users.get(otherUserId);

      if (!user) {
        ws.close();
        return;
      }

      const sender = await prisma.user.findFirst({
        where: { id: ws.userId },
      });

      if (!sender) {
        ws.close();
        return;
      }

      user.ws.send(
        JSON.stringify({
          type: parsedData.type,
          payload: {
            from: {
              name: sender.userName,
              id: sender.id,
              // or more
            },
          },
        }),
      );
    }

    if (parsedData.type === MESSAGE_TYPE.UN_SUBSCRIBE_ONLINE_USER) {
      const user = users.get(ws.userId);
      if (!user) {
        ws.close();
        return;
      }

      users.delete(ws.userId);
      users.set(ws.userId, {
        ...user,
        wantOnlineUsers: false,
      });
    }

    if (parsedData.type === MESSAGE_TYPE.GAME_REQUEST) {
      const { gameId } = parsedData.payload;

      const game = await prisma.game.findFirst({
        where: { id: gameId },
      });

      if (!game) {
        ws.close();
        return;
      }

      const user = users.get(ws.userId);

      if (!user) {
        ws.close();
        return;
      }

      users.delete(ws.userId);
      users.set(ws.userId, {
        ...user,
        inGame: true,
      });

      games.set(game.id, [user]);

      updateUserGameStatus("SEARCHING", ws.userId);

      users.forEach((usr) => {
        if (usr.ws === ws || !usr.isOnline || usr.inGame) return;

        // TODO: we should add ranking based match making

        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            payload: { game },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.GAME_ACCEPT) {
      const { gameId } = parsedData.payload;

      const game = await prisma.game.findFirst({
        where: { id: gameId },
      });

      if (!game) {
        ws.close();
        return;
      }

      const startTime = new Date();
      const endTime = new Date(Date.now() + game.timeLimit * 60 * 1000);

      await prisma.game.update({
        where: { id: game.id },
        data: {
          endTime,
          startTime,
        },
      });

      await prisma.gamePlayer.create({
        data: {
          gameId: game.id,
          userId: ws.userId,
        },
      });

      const user = users.get(ws.userId);

      if (!user) {
        ws.close();
        return;
      }

      users.delete(ws.userId);
      users.set(ws.userId, {
        ...user,
        inGame: true,
      });

      const totalUsersInGame = games.get(game.id);

      if (!totalUsersInGame) {
        ws.close();
        return;
      }

      games.set(game.id, [...totalUsersInGame, user]);

      updateUserGameStatus("SEARCHING", ws.userId);

      const inGameusers = games.get(game.id);

      if (!inGameusers) {
        ws.close();
        return;
      }

      inGameusers.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.READY,
            payload: { gameId: game.id },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.GAME_STARTS) {
      const { gameId } = parsedData.payload;

      const game = await prisma.game.findFirst({
        where: { id: gameId },
      });

      if (!game) {
        ws.close();
        return;
      }

      const randomQuestions = generateRandomQuesions();
      questions.set(game.id, randomQuestions);

      let counter = questionCounter.get(game.id) || 0;
      questionCounter.set(game.id, counter);

      const users = games.get(game.id);

      if (!users) {
        ws.close();
        return;
      }

      const question = randomQuestions[counter]!;

      const dbQuestion = await prisma.question.create({
        data: {
          answer: question.answer,
          operand1: question.operand1,
          operand2: question.operand2,
          operation: question.operation,
        },
      });

      await prisma.gameQuestion.create({
        data: {
          questionId: dbQuestion.id,
          gameId,
          orderIndex: counter,
        },
      });

      questionTiming.set(question.id, Date.now());

      users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ROUND_STARTED,
            payload: {
              question,
            },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.GAME_ANSWER) {
      const { gameId, questionId, answer } = parsedData.payload;

      const game = await prisma.game.findFirst({
        where: { id: gameId },
      });

      if (!game) {
        ws.close();
        return;
      }

      const allQuestions = questions.get(game.id);

      if (!allQuestions) {
        ws.close();
        return;
      }

      const question = allQuestions.find((qs) => qs.id === questionId);

      if (!question) {
        ws.close();
        return;
      }

      // upserting the answer here

      const submittedAt = questionTiming.get(question.id);

      const timeSpent = Date.now() - submittedAt!;

      await prisma.userAnswer.upsert({
        where: {
          gameId_userId_questionId: {
            gameId,
            questionId: question.id,
            userId: ws.userId,
          },
        },
        create: {
          questionId: question.id,
          gameId,
          userId: ws.userId,
          answer: Number(answer),
          isCorrect: false,
          timeSpent,
        },
        update: {},
      });

      if (question.answer !== Number(answer)) {
        // we have already marked the question as isCoorect false so...
        return;
      }

      // updating the status here for iscorrent true
      await prisma.userAnswer.update({
        where: {
          gameId_userId_questionId: {
            gameId,
            questionId: question.id,
            userId: ws.userId,
          },
        },
        data: {
          isCorrect: true,
        },
      });

      // sending the next question to the user and create this question in db too

      let counter = questionCounter.get(game.id)!
      counter += 1;

      questionCounter.set(game.id, counter);

      const realQuestions = questions.get(game.id);

      const realQs = realQuestions![counter]! 

      const users = games.get(game.id);

      if (!users) {
        ws.close();
        return;
      }

      const dbQuestion = await prisma.question.create({
        data: {
          answer: realQs.answer,
          operand1: realQs.operand1,
          operand2: realQs.operand2,
          operation: realQs.operation,
        },
      });

      await prisma.gameQuestion.create({
        data: {
          questionId: dbQuestion.id,
          gameId,
          orderIndex: counter,
        },
      });

      questionTiming.set(realQs.id, Date.now());

      users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ROUND_STARTED,
            payload: {
              question: realQs,
            },
          }),
        );
      });
    }
  });

  ws.on("close", () => {
    console.log("left");
    users.delete(ws.userId);
    updateUserOnlineStatus(false, ws.userId);
  });
});

async function updateUserOnlineStatus(val: boolean, userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: val },
  });
}

async function sendOnlineUsers(users: Map<string, User>) {
  // TODO: will this work??
  console.log("just checking ", Object.keys(users));
  if (Object.keys(users).length === 1) return;

  setInterval(() => {
    users.forEach((usr) => {
      if (!usr.wantOnlineUsers) return;

      usr.ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE,
        }),
      );
    });
  }, 5000);
}

async function updateUserGameStatus(
  status: "IDOL" | "PLAYING" | "SEARCHING",
  userId: string,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
}

function getRandomNums() {
  let a = Math.floor(Math.random() * 10 * 6);
  let b = Math.floor(Math.random() * 10 * 3);

  return { a, b };
}

function generateRandomQuesions(): Question[] {
  let arr: Question[] = [];

  for (let i = 1; i <= 20; i++) {
    const { a, b } = getRandomNums();

    arr.push({
      id: crypto.randomUUID(),
      answer: a + b,
      createdAt: new Date(),
      operand1: a,
      operand2: b,
      operation: "ADD",
    });
  }
  return arr;
}
