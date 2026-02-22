import { WebSocketServer } from "ws";
import { MESSAGE_TYPE } from "@repo/common/common";
import { prisma, type Question, type UserAnswer } from "@repo/db/db";
import type { ExtendedWS, WsGame, WsUser } from "./types";
import {
  generateRandomQuesions,
  updateUserOnlineStatus,
  updateUserStatus,
  verifyUser,
} from "./utils";

const server = new WebSocketServer({ port: Number(process.env.PORT) });

// userId and users
const users: Map<string, WsUser> = new Map();

// gameId, game with all the details
const games: Map<string, WsGame> = new Map();

// game id with all the questions
const randomQuestionsInMemory: Map<string, Question[]> = new Map();

// gameId and question index (for finding that which question to send now)
const questionCounter: Map<string, number> = new Map();

// question Id and answers at (for calculating the response from the user of a particular ques.)
const questionTiming: Map<string, number> = new Map();

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
    ...user,
    ws,
    isOnline: true,
    wantOnlineUsers: true,
    inGame: false,
    gameAnswers: [],
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
      if (users.size === 1) return;

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

      games.set(game.id, {
        ...game,
        users: [{ ...user, joinedAt: new Date() }],
        answers: [],
        questions: [],
      });

      updateUserStatus("SEARCHING", ws.userId);

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

      const presentGame = games.get(game.id);

      if (!presentGame) {
        ws.close();
        return;
      }

      games.set(game.id, {
        ...game,
        endTime,
        startTime,
        users: [...presentGame.users, { ...user, joinedAt: new Date() }],
        answers: [],
        questions: [],
      });

      updateUserStatus("SEARCHING", ws.userId);

      presentGame.users.forEach((usr) => {
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

      const presentGame = games.get(game.id);

      if (!presentGame) {
        ws.close();
        return;
      }

      // setting the
      let counter = questionCounter.get(game.id) || 0;
      questionCounter.set(game.id, counter);

      // generating questions for using the whole game
      const randomQuestions = generateRandomQuesions();

      randomQuestionsInMemory.set(presentGame.id, randomQuestions);

      const question = randomQuestions[counter]!;

      questionTiming.set(question.id, Date.now());

      presentGame.questions.push(question);

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

      const presentGame = games.get(game.id);

      if (!presentGame) {
        ws.close();
        return;
      }

      const allQuestions = randomQuestionsInMemory.get(game.id);

      if (!allQuestions) {
        ws.close();
        return;
      }

      const question = allQuestions.find((qs) => qs.id === questionId);

      if (!question) {
        ws.close();
        return;
      }
      const startedAt = questionTiming.get(question.id);
      questionTiming.delete(question.id);

      const timeSpent = Date.now() - startedAt!;

      const isAnswerExists = presentGame.answers.find(
        (ans) => ans.questionId == question.id,
      );

      if (isAnswerExists) {
        if (question.answer !== Number(answer)) {
          return;
        }

        const newAnwer: UserAnswer = { ...isAnswerExists, isCorrect: true };
        const updatedAnswers = presentGame.answers.filter(
          (ans) => ans.id !== isAnswerExists.id,
        );

        presentGame.answers = [...updatedAnswers, newAnwer];
        return;
      }

      if (!isAnswerExists) {
        presentGame.answers.push({
          answer,
          answeredAt: new Date(),
          isCorrect: false,
          timeSpent,
          userId: ws.userId,
          gameId: game.id,
          id: crypto.randomUUID(),
          questionId: question.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (question.answer !== Number(answer)) {
        return;
      }

      // sending the next question to the user and create this question in db too

      let counter = questionCounter.get(game.id)!;
      counter += 1;
      questionCounter.delete(game.id);

      questionCounter.set(game.id, counter);

      const nextQs = allQuestions![counter]!;

      questionTiming.set(nextQs.id, Date.now());

      presentGame.users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ROUND_STARTED,
            payload: {
              question: nextQs,
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
