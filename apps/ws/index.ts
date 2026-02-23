// TODO: adding users left logic
// TODO: while adding answer ( we should add something random to it ) so that
// users can't see the exact answer
// TODO: adding logic on the server for handling game ends

import { WebSocketServer } from "ws";
import { MESSAGE_TYPE } from "@repo/common/common";
import { prisma, type Question, type UserAnswer } from "@repo/db/db";
import type { ExtendedWS, WsGame, WsUser } from "./types";
import {
  generateRandomQuesions,
  updateUserOnlineStatus,
  verifyUser,
} from "./utils";

const server = new WebSocketServer({ port: Number(process.env.PORT) });

// userId and users
const users: Map<string, WsUser> = new Map();

// gameId, game with all the details
const games: Map<string, WsGame> = new Map();

// game id with all the questions
const randomQuestionsInMemory: Map<string, Question[]> = new Map();

// gameId-userId and question index (for finding that which question to send now)
const questionCounter: Map<string, number> = new Map();

// question Id | userId and answers at (for calculating the response from the user of a particular ques.)
const questionTiming: Map<string, number> = new Map();

server.on("connection", async (ws: ExtendedWS, req) => {
  console.log("connected");

  // we should send token from client like this
  // ws://localhost:8080/?token="TOKEN"
  const token = req.url?.split("?")[1]?.split("=")[1];
  console.log("extracting token");

  if (!token) {
    ws.close();
    return;
  }

  console.log("finding user");
  const user = await verifyUser(token);

  if (!user) {
    console.log("user not found");
    ws.close();
    return;
  }

  console.log("setting users details in memory");
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

  ws.on("error", (err) => console.log(err));

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
      console.log("subscribe to online_users with the users size ", users.size);
      if (users.size === 1) return;

      ws.send(
        JSON.stringify({
          type: parsedData.type,
          payload: { users: Array.from(users) },
        }),
      );
    }

    if (
      parsedData.type === MESSAGE_TYPE.FRIEND_REQUEST ||
      parsedData.type === MESSAGE_TYPE.FRIEND_ACCEPT
    ) {
      console.log("someone sent ", parsedData.type);
      const { otherUserId } = parsedData.payload;

      console.log("finding user from in-memory");
      const user = users.get(otherUserId);
      const sender = users.get(ws.userId);

      if (!user) {
        console.log("user not found");
        ws.close();
        return;
      }

      if (!sender) {
        console.log("sender not found");
        ws.close();
        return;
      }

      console.log(`sending ${parsedData.type} to the user`);
      user.ws.send(
        JSON.stringify({
          type: parsedData.type,
          payload: {
            from: {
              name: sender.userName,
              id: sender.id,
              // or more maybe profile image in future
            },
          },
        }),
      );
    }

    if (parsedData.type === MESSAGE_TYPE.UN_SUBSCRIBE_ONLINE_USER) {
      console.log("un-subscribe from online_users");
      const user = users.get(ws.userId);
      console.log("finding that user");
      if (!user) {
        ws.close();
        return;
      }

      console.log("deleting and updating the user in memory");
      users.delete(ws.userId);
      users.set(ws.userId, {
        ...user,
        wantOnlineUsers: false,
      });

      console.log("sending online users to all the user");
      users.forEach((usr) => {
        if (!usr.wantOnlineUsers) return;

        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            payload: { users: Array.from(users) },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.GAME_REQUEST) {
      const { gameId } = parsedData.payload;
      console.log("sending game request ", gameId);

      const user = users.get(ws.userId);
      console.log("finding user from the in-memory db");

      if (!user) {
        console.log("user not found");
        ws.close();
        return;
      }

      console.log("finding game from the db");
      const game = await prisma.game.findFirst({
        where: { id: gameId, createdBy: user.id },
      });

      if (!game) {
        console.log("game not found");
        ws.close();
        return;
      }

      console.log("deleting and updating user in memroy");
      users.delete(ws.userId);
      users.set(ws.userId, {
        ...user,
        inGame: true,
      });

      console.log("setting game in memory with the user");
      games.set(game.id, {
        ...game,
        users: [{ ...user, joinedAt: new Date() }],
        answers: [],
        questions: [],
      });

      console.log("sending request to all the users except some people");
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
      console.log("accepting game ", gameId);

      console.log("finding game from the db");
      const game = await prisma.game.findFirst({
        where: { id: gameId },
      });

      if (!game) {
        console.log("game not found");
        ws.close();
        return;
      }

      console.log("defining start and end time");
      const startTime = new Date();
      // game.timeLimit = 1 | 2 | 3 (in minutes)
      // TODO: maybe we have change the way we are deriving endtime like we have to normalize
      // it and then denormalize on the fronend like we have done in the skribbl one
      const endTime = new Date(Date.now() + game.timeLimit * 60 * 1000);

      const user = users.get(ws.userId);
      console.log("finding user from in memory");

      if (!user) {
        console.log("user not found");
        ws.close();
        return;
      }

      console.log("deleting and updating user");
      users.delete(ws.userId);
      users.set(ws.userId, {
        ...user,
        inGame: true,
      });

      console.log("finding the current game from in-memory db");
      const presentGame = games.get(game.id);

      if (!presentGame) {
        console.log("game not found");
        ws.close();
        return;
      }

      games.delete(game.id);

      console.log("updating the game with new user, endtime and startime");
      games.set(game.id, {
        ...game,
        endTime,
        startTime,
        users: [...presentGame.users, { ...user, joinedAt: new Date() }],
        answers: [],
        questions: [],
      });

      const newGame = games.get(game.id);

      if (!newGame) {
        console.log("game not found");
        ws.close();
        return;
      }

      console.log("sending ready to all the users in the game");
      newGame.users.forEach((usr) => {
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
      console.log("game starts ", gameId);

      console.log("finding game from the db");
      const game = await prisma.game.findFirst({
        where: { id: gameId },
      });

      if (!game) {
        console.log("game not found");
        ws.close();
        return;
      }

      console.log("finding game from in-memory");
      const presentGame = games.get(game.id);

      if (!presentGame) {
        console.log("in memory game not found");
        ws.close();
        return;
      }

      const counter = questionCounter.get(`${game.id}-${ws.userId}`) || 0;
      console.log("getting and setting counter from in-memory ", counter);
      questionCounter.set(`${game.id}-${ws.userId}`, counter);

      console.log("generating and setting questions for using the whole game");
      const randomQuestions = generateRandomQuesions();
      randomQuestionsInMemory.set(presentGame.id, randomQuestions);

      console.log(`getting ${counter} from all questions`);
      const question = randomQuestions[counter]!;

      console.log("setting questions starttime with question id and userid");
      questionTiming.set(`${question.id}-${ws.userId}`, Date.now());

      console.log("pushing question in the present game in meomey");
      presentGame.questions.push(question);

      console.log("sending all the users that game started");
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
      console.log("game answering starts");

      console.log("finding game from the db");
      const game = await prisma.game.findFirst({
        where: { id: gameId },
      });

      if (!game) {
        console.log("game not found");
        ws.close();
        return;
      }

      const presentGame = games.get(game.id);
      console.log("finding game from in-memory");

      if (!presentGame) {
        console.log("in-memory game found");
        ws.close();
        return;
      }

      console.log("getting allquestions from in-memory");
      const allQuestions = randomQuestionsInMemory.get(game.id);

      if (!allQuestions) {
        console.log("questions from in-memory not found");
        ws.close();
        return;
      }

      console.log(
        "finding that particular question with id from in-memory ",
        questionId,
      );
      const question = allQuestions.find((qs) => qs.id === questionId);

      if (!question) {
        console.log("question not found");
        ws.close();
        return;
      }

      console.log("getting and deleting starttime of that question");
      const startedAt = questionTiming.get(`${question.id}-${ws.userId}`);

      console.log("calculating time spent");
      const timeSpent = Date.now() - startedAt!;

      console.log("finding answer from in-memory db");
      const isAnswerExists = presentGame.answers.find(
        (ans) => ans.questionId == question.id && ans.userId === ws.userId,
      );

      if (isAnswerExists) {
        if (question.answer !== Number(answer)) {
          console.log("answer already exits but wrong");
          return;
        }
        console.log("answer already exists but right");
        const newAnwer: UserAnswer = { ...isAnswerExists, isCorrect: true };
        const updatedAnswers = presentGame.answers.filter(
          (ans) => ans.id !== isAnswerExists.id,
        );
        console.log(
          "updating the answer corrent value to true and deleting the time stamp",
        );
        questionTiming.delete(`${question.id}-${ws.userId}`);
        presentGame.answers = [...updatedAnswers, newAnwer];
      }

      if (!isAnswerExists) {
        if (question.answer !== Number(answer)) {
          console.log("answer not found and was wrong");
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
          return;
        } else {
          console.log("answer found and was right");
          questionTiming.delete(`${question.id}-${ws.userId}`);
          presentGame.answers.push({
            answer,
            answeredAt: new Date(),
            isCorrect: true,
            timeSpent,
            userId: ws.userId,
            gameId: game.id,
            id: crypto.randomUUID(),
            questionId: question.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      let counter = questionCounter.get(`${game.id}-${ws.userId}`)!;
      counter += 1;
      console.log(
        "getting, incrementing deleting and seeting question counter",
        counter,
      );
      questionCounter.delete(`${game.id}-${ws.userId}`);
      questionCounter.set(`${game.id}-${ws.userId}`, counter);

      console.log("finding the next question from all the questions");
      const nextQs = allQuestions![counter]!;

      console.log("setting time stamps for new questions");
      questionTiming.set(`${nextQs.id}-${ws.userId}`, Date.now());

      console.log("sending new question to that only user");
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.ROUND_STARTED,
          payload: {
            question: nextQs,
          },
        }),
      );
    }
  });

  ws.on("close", () => {
    console.log("left");
    users.delete(ws.userId);
    updateUserOnlineStatus(false, ws.userId);
  });
});
