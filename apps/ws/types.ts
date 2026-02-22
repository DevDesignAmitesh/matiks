import type {
  Game,
  UserAnswer,
  User,
  Question,
} from "@repo/db/db";
import type { WebSocket } from "ws";

export interface ExtendedWS extends WebSocket {
  userId: string;
}

export interface WsUser extends User {
  gameAnswers: Array<UserAnswer>;
  isOnline: boolean;
  wantOnlineUsers: boolean;
  inGame: boolean;
  ws: WebSocket;
}

export interface WsGame extends Game {
  users: Array<WsUser & { joinedAt: Date }>;
  answers: Array<UserAnswer>;
  questions: Array<Question>;
}
