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

const users: Map<string, User> = new Map();
const games: Map<string, User[]> = new Map();

const verifyUser = (token: string) => {
  return verify(token, process.env.JWT_SECRET!) as { userId: string };
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
            type: MESSAGE_TYPE.GAME_STARTS,
            payload: { gameId: game.id },
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
