import prisma from '../town/client';

export async function upsertUser(userId: string, userEmail: string) {
  return prisma.user.upsert({
    where: { id: userId },
    update: { lastLogin: new Date() },
    create: {
      id: userId,
      email: userEmail,
    },
  });
}

export async function updateUser(userId: string, sessionDuration: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lastLogin: new Date(),
      totalTimeSpent: {
        increment: Math.floor(sessionDuration),
      },
    },
  });
}
