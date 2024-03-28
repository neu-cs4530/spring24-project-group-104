import { upsertUser, updateUser } from '../utils/prismaCRUD';
import { prismaMock } from './singleton';

test('should upsert new user ', async () => {
  const user = {
    id: '1',
    name: 'Rich',
    email: 'hello@prisma.io',
    displayName: null,
    signUpDate: new Date(1995, 11, 17),
    lastLogin: null,
    totalTimeSpent: null,
    totalGamesPlayed: null,
  };

  prismaMock.user.upsert.mockResolvedValue(user);

  await expect(upsertUser(user.id, user.email)).resolves.toEqual({
    id: '1',
    name: 'Rich',
    email: 'hello@prisma.io',
    displayName: null,
    signUpDate: new Date(1995, 11, 17),
    lastLogin: null,
    totalTimeSpent: null,
    totalGamesPlayed: null,
  });
});

test('should update a users name ', async () => {
  const user = {
    id: '1',
    name: 'Rich',
    email: 'hello@prisma.io',
    displayName: null,
    signUpDate: new Date(2001, 4, 15),
    lastLogin: null,
    totalTimeSpent: null,
    totalGamesPlayed: null,
  };

  prismaMock.user.update.mockResolvedValue(user);
  const sessionDuration = 60;
  await expect(updateUser('19', sessionDuration)).resolves.toEqual({
    id: '1',
    name: 'Rich',
    email: 'hello@prisma.io',
    displayName: null,
    signUpDate: new Date(2001, 4, 15),
    lastLogin: null,
    totalTimeSpent: null,
    totalGamesPlayed: null,
  });
});
