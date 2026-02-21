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
  userName: string;
  email: string;
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

interface Game {
  id: string;
  status:
    | "WAITING_FOR_PLAYERS"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED";
  createdBy: string;
  endTime: Date | null;
  startTime: Date | null;
  rematchRequestedBy: string | null;
  timeLimit: number;
  numberOfPlayers: number;
}

// userId and users
const users: Map<string, User> = new Map();

// gameId and users
const games: Map<string, { game: Game; users: User[] }> = new Map();

// gameId and questions
const questions: Map<string, Question[]> = new Map();

// gameId and question index
const questionCounter: Map<string, number> = new Map();

// question Id and answers at
const questionTiming: Map<string, number> = new Map();

const verifyUser = async (token: string) => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    return await prisma.user.findFirst({
      where: { id: decoded.userId },
    });
  } catch (e) {
    console.log("error while verfying user in jwt ", e);
    return null;
  }
};

server.on("connection", async (ws: ExtendedWS, req) => {
  console.log("connected");

  // we should send token from client like this
  // ws://localhost:8080/?token="TOKEN"
  const token = req.url?.split("?")[1]?.split("=")[1];

  if (!token) {
    ws.close();
    return;
  }

  const user = await verifyUser(token);

  if (!user) {
    ws.close();
    return;
  }

  ws.userId = user.id;

  users.set(user.id, {
    id: user.id,
    ws,
    email: user.email,
    userName: user.userName,
    isOnline: true,
    wantOnlineUsers: true,
    inGame: false,
  });

  updateUserOnlineStatus(true, ws.userId);

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

    if (parsedData.type === MESSAGE_TYPE.SUBSCRIBE_ONLINE_USER) {
      console.log("just checking ", Object.keys(users).length);
      if (Object.keys(users).length === 1) return;

      users.forEach((usr) => {
        if (!usr.wantOnlineUsers) return;

        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            payload: { users },
          }),
        );
      });
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

      user.ws.send(
        JSON.stringify({
          type: parsedData.type,
          payload: {
            from: {
              name: user.userName,
              id: user.id,
              // or more maybe profile image in future
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

      games.set(game.id, { game, users: [user] });

      updateUserGameStatus("SEARCHING", ws.userId);

      users.forEach((usr) => {
        if (usr.ws === ws || !usr.isOnline || usr.inGame) return;

        // TODO: we should add ranking based match-making

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

      games.set(game.id, {
        game: { ...game, endTime, startTime },
        users: [...totalUsersInGame.users, user],
      });

      updateUserGameStatus("SEARCHING", ws.userId);

      const inGameusers = games.get(game.id);

      if (!inGameusers) {
        ws.close();
        return;
      }

      inGameusers.users.forEach((usr) => {
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

      // generating questions for using the whole game
      const randomQuestions = generateRandomQuesions();
      questions.set(game.id, randomQuestions);

      // setting the
      let counter = questionCounter.get(game.id) || 0;
      questionCounter.set(game.id, counter);

      const presentGame = games.get(game.id);

      if (!presentGame) {
        ws.close();
        return;
      }

      const question = randomQuestions[counter]!;

      questionTiming.set(question.id, Date.now());

      presentGame.users.forEach((usr) => {
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
      questionTiming.delete(question.id);

      const timeSpent = Date.now() - submittedAt!;

      if (question.answer !== Number(answer)) {
        // we have already marked the question as isCoorect false so...
        return;
      }

      // sending the next question to the user and create this question in db too

      let counter = questionCounter.get(game.id)!;
      counter += 1;

      questionCounter.set(game.id, counter);

      const realQuestions = questions.get(game.id);

      const realQs = realQuestions![counter]!;

      const presentGame = games.get(game.id);

      if (!presentGame) {
        ws.close();
        return;
      }

      questionTiming.set(realQs.id, Date.now());

      presentGame.users.forEach((usr) => {
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
