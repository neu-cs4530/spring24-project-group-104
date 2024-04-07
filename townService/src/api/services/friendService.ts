import prisma from '../repositories/PrismaClient';

// eslint-disable-next-line import/prefer-default-export
export const createFriendship = async (userID1: string, userID2: string) => {
  try {
    const user1 = userID1 < userID2 ? userID1 : userID2;
    const user2 = userID1 < userID2 ? userID2 : userID1;

    return await prisma.friendship.create({
      data: {
        userID1: user1,
        userID2: user2,
      },
    });
  } catch (error) {
    throw new Error(`Error creating friendship: ${error}`);
  }
};
