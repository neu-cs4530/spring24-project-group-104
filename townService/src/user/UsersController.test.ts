import { nanoid } from 'nanoid';
import { UsersController } from './UsersController';
import { prisma } from '../Utils';

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    usersController = new UsersController();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserStats', () => {
    it('should return user stats for a valid user ID, no game', async () => {
      // Mock the necessary dependencies
      const userID = nanoid();
      const sessionToken = 'abc';
      const expectedUserStats = {
        id: userID,
        displayName: 'John Doe',
        signUpDate: new Date(),
        lastLogin: new Date(),
        totalTimeSpent: 100,
        totalGamesPlayed: 5,
      };
      const inUserStatsForm = {
        firstJoined: expectedUserStats.signUpDate.toDateString(),
        timeSpent: expectedUserStats.totalTimeSpent,
        gameRecords: [],
      };

      // Add the user record to the database
      await prisma.user.create({
        data: {
          id: userID,
          displayName: expectedUserStats.displayName,
          signUpDate: expectedUserStats.signUpDate,
          lastLogin: expectedUserStats.lastLogin,
          totalTimeSpent: expectedUserStats.totalTimeSpent,
          totalGamesPlayed: expectedUserStats.totalGamesPlayed,
        },
      });

      // Call the getUserStats method
      const result = await usersController.getUserStats(userID, sessionToken);

      // Assert the result
      expect(result).toEqual(inUserStatsForm);
    });

    it('should return user stats for a valid user ID , with games', async () => {
      const userID = nanoid();
      const sessionToken = 'abc';
      const expectedUserStats = {
        id: userID,
        displayName: 'Jane Doe',
        signUpDate: new Date(),
        lastLogin: new Date(),
        totalTimeSpent: 100,
        totalGamesPlayed: 5,
      };
      const inUserStatsForm = {
        firstJoined: expectedUserStats.signUpDate.toDateString(),
        timeSpent: expectedUserStats.totalTimeSpent,
        gameRecords: [
          {
            gameName: 'TicTacToe',
            wins: 2,
            losses: 1,
          },
          {
            gameName: 'ConnectFour',
            wins: 1,
            losses: 0,
          },
        ],
      };

      // Add the user record to the database
      await prisma.user.create({
        data: {
          id: userID,
          displayName: expectedUserStats.displayName,
          signUpDate: expectedUserStats.signUpDate,
          lastLogin: expectedUserStats.lastLogin,
          totalTimeSpent: expectedUserStats.totalTimeSpent,
          totalGamesPlayed: expectedUserStats.totalGamesPlayed,
        },
      });

      // Add game records to the database
      await prisma.gameRecord.create({
        data: {
          userId: userID,
          gameId: 'TicTacToe',
          win: true,
        },
      });
      await prisma.gameRecord.create({
        data: {
          userId: userID,
          gameId: 'TicTacToe',
          win: false,
        },
      });
      await prisma.gameRecord.create({
        data: {
          userId: userID,
          gameId: 'TicTacToe',
          win: true,
        },
      });
      await prisma.gameRecord.create({
        data: {
          userId: userID,
          gameId: 'ConnectFour',
          win: true,
        },
      });

      // Call the getUserStats method
      const result = await usersController.getUserStats(userID, sessionToken);

      // Assert the result
      expect(result).toEqual(inUserStatsForm);
    });

    it('should throw an error for invalid user ID', async () => {
      // Mock the necessary dependencies
      const userID = 'invalid';
      const sessionToken = 'abc';
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Call the getUserStats method and expect it to throw an error
      await expect(usersController.getUserStats(userID, sessionToken)).rejects.toThrowError();
    });
  });
});
