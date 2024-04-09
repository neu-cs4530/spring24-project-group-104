import { nanoid } from 'nanoid';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UsersController } from './UsersController';
import { prisma } from '../Utils';
import TownsStore from '../lib/TownsStore';
import { TownEmitter } from '../types/CoveyTownSocket';

const broadcastEmitter = jest.fn();

describe('UsersController', () => {
  let usersController: UsersController;
  const createdTownEmitters: Map<string, DeepMockProxy<TownEmitter>> = new Map();
  let townsStore: TownsStore;

  beforeEach(async () => {
    broadcastEmitter.mockImplementation((townID: string) => {
      const mockRoomEmitter = mockDeep<TownEmitter>();
      createdTownEmitters.set(townID, mockRoomEmitter);
      return mockRoomEmitter;
    });
    TownsStore.initializeTownsStore(broadcastEmitter);
    townsStore = TownsStore.getInstance();
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
        displayName: nanoid(),
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
        displayName: nanoid(),
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
      const userID = nanoid();
      const sessionToken = 'abc';
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Call the getUserStats method and expect it to throw an error
      await expect(usersController.getUserStats(userID, sessionToken)).rejects.toThrowError();
    });
  });

  describe('listRecentlyVistedTowns', () => {
    it('should return a list of recently visited towns for a valid user ID', async () => {
      // Mock the necessary dependencies
      const userID = nanoid();
      const firstTown = await townsStore.createTown('firstTown', true);
      const secondTown = await townsStore.createTown('secondTown', true);
      const expectedTowns = [
        {
          townId: firstTown.townID,
          lastVisited: new Date(),
        },
        {
          townId: secondTown.townID,
          lastVisited: new Date(),
        },
      ];

      // Add the user record to the database
      await prisma.user
        .create({
          data: {
            id: userID,
            displayName: nanoid(),
            signUpDate: new Date(),
            lastLogin: new Date(),
            totalTimeSpent: 100,
            totalGamesPlayed: 5,
          },
        })
        .then(res => res);

      // Add the town visits to the database
      await prisma.townVisit
        .create({
          data: {
            userId: userID,
            townId: expectedTowns[0].townId,
            visitedAt: expectedTowns[0].lastVisited,
          },
        })
        .then(res => res);
      await prisma.townVisit
        .create({
          data: {
            userId: userID,
            townId: expectedTowns[1].townId,
            visitedAt: expectedTowns[1].lastVisited,
          },
        })
        .then(res => res);

      // Call the listRecentlyVistedTowns method
      const result = await usersController.listRecentlyVistedTowns(userID);

      // Assert the result
      expect(result).toEqual(expectedTowns);
    });

    it('should return a list of recently visited towns for a valid user ID, excluding towns not currently active', async () => {
      // Mock the necessary dependencies
      const userID = nanoid();
      const firstTown = await townsStore.createTown('firstTown', true);
      const secondTown = await townsStore.createTown('secondTown', true);
      const expectedTowns = [
        {
          townId: firstTown.townID,
          lastVisited: new Date(),
        },
        {
          townId: secondTown.townID,
          lastVisited: new Date(),
        },
      ];

      // Add the user record to the database
      await prisma.user
        .create({
          data: {
            id: userID,
            displayName: nanoid(),
            signUpDate: new Date(),
            lastLogin: new Date(),
            totalTimeSpent: 100,
            totalGamesPlayed: 5,
          },
        })
        .then(res => res);

      // Add the town visits to the database
      await prisma.townVisit
        .create({
          data: {
            userId: userID,
            townId: expectedTowns[0].townId,
            visitedAt: expectedTowns[0].lastVisited,
          },
        })
        .then(res => res);
      await prisma.townVisit
        .create({
          data: {
            userId: userID,
            townId: expectedTowns[1].townId,
            visitedAt: expectedTowns[1].lastVisited,
          },
        })
        .then(res => res);

      try {
        townsStore.deleteTown(secondTown.townID, secondTown.townUpdatePassword);
      } catch (e) {
        // Do nothing. This is fine because we did not
      }
      // Call the listRecentlyVistedTowns method
      const result = await usersController.listRecentlyVistedTowns(userID);

      // Assert the result
      expect(result).toEqual([expectedTowns[0]]);
    });

    it('should only return the most recent visit for a given town', async () => {
      // Mock the necessary dependencies
      const userID = nanoid();
      const town = await townsStore.createTown('town', true);
      const expectedTowns = [
        {
          townId: town.townID,
          lastVisited: new Date(),
        },
        {
          townId: town.townID,
          lastVisited: new Date(new Date().getTime() + 1000),
        },
      ];

      // Add the user record to the database
      await prisma.user
        .create({
          data: {
            id: userID,
            displayName: nanoid(),
            signUpDate: new Date(),
            lastLogin: new Date(),
            totalTimeSpent: 100,
            totalGamesPlayed: 5,
          },
        })
        .then(res => res);

      // Add the town visits to the database
      await prisma.townVisit
        .create({
          data: {
            userId: userID,
            townId: expectedTowns[0].townId,
            visitedAt: expectedTowns[0].lastVisited,
          },
        })
        .then(res => res);
      await prisma.townVisit
        .create({
          data: {
            userId: userID,
            townId: expectedTowns[1].townId,
            visitedAt: expectedTowns[1].lastVisited,
          },
        })
        .then(res => res);

      // Call the listRecentlyVistedTowns method
      const result = await usersController.listRecentlyVistedTowns(userID);

      // Assert the result
      expect(result).toEqual([expectedTowns[1]]);
    });

    it('should return an empty list for an invalid user ID', async () => {
      // Mock the necessary dependencies
      const userID = nanoid();
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Call the listRecentlyVistedTowns method
      const result = await usersController.listRecentlyVistedTowns(userID);

      // Assert the result
      expect(result).toEqual([]);
    });
  });
});
