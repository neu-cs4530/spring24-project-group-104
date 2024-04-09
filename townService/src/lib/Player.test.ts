import { User } from '@prisma/client';
import { nanoid } from 'nanoid';
import Player from './Player';
import { prisma } from '../Utils';
import { TownEmitter } from '../types/CoveyTownSocket';

describe('Player', () => {
  describe('registerPlayerInDatabase', () => {
    it('should register the player in the database and return a User object', async () => {
      // Create a mock instance of TownEmitter (not used in this test, so just using empty object)
      const townEmitter = {} as TownEmitter;

      // Create a mock instance of Player
      const player = new Player(nanoid(), townEmitter);

      player
        .registerPlayerInDatabase()
        .then(x =>
          prisma.user
            .findFirst({
              where: {
                id: player.id,
              },
            })
            .then((res: User | null) => {
              expect(res).toBeDefined();
              expect(res?.displayName).toBe(player.userName);
              expect(res?.lastLogin).toBeDefined();
              expect(res?.totalTimeSpent).toBe(0);
            }),
        )
        .then(x => prisma.user.delete({ where: { id: player.id } }));
    });

    it('should update player last login if player already exists in the database', async () => {
      // Create a mock instance of TownEmitter (not used in this test, so just using empty object)
      const townEmitter = {} as TownEmitter;

      // Create a mock instance of Player
      const player = new Player(nanoid(), townEmitter);

      player
        .registerPlayerInDatabase()
        .then(x => player.registerPlayerInDatabase())
        .then(x =>
          prisma.user
            .findFirst({
              where: {
                id: player.id,
              },
            })
            .then((res: User | null) => {
              expect(res).toBeDefined();
              expect(res?.displayName).toBe(player.userName);
              expect(res?.lastLogin).toBeDefined();
              expect(res?.lastLogin).not.toBe(res?.signUpDate);
            }),
        )
        .then(x => prisma.user.delete({ where: { id: player.id } }));
    });
  });
});
