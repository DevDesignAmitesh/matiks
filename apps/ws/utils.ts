import { prisma, type Question } from "@repo/db/db";
import { verify } from "jsonwebtoken";

export async function updateUserOnlineStatus(val: boolean, userId: string) {
  console.log("updating users online status by ", val);
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: val },
  });
}

export async function updateUserStatus(
  status: "IDOL" | "PLAYING" | "SEARCHING",
  userId: string,
) {
  console.log("updating user status by ",status);
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

export function generateRandomQuesions(): Array<Question> {
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

export const verifyUser = async (token: string) => {
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
