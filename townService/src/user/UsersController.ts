import { Controller, Route, Tags, Get, Header, Path, Response } from 'tsoa';
import { GameRecord } from '@prisma/client';
import InvalidParametersError from '../lib/InvalidParametersError';
import { UserStats } from '../types/CoveyTownSocket';
import { prisma } from '../Utils';

/**
 * This is the town route
 */
@Route('users')
@Tags('users')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class UsersController extends Controller {
  @Get('{userID}/userStats')
  @Response<InvalidParametersError>(400, 'Invalid values Specified')
  public async getUserStats(
    @Path() userID: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<UserStats> {
    const userRecords = await prisma.user.findUnique({
      where: {
        id: userID,
      },
      include: {
        gameRecords: true,
      },
    });
    if (!userRecords) {
      throw new InvalidParametersError('Invalid values specified');
    }
    return {
      firstJoined: userRecords.signUpDate.toDateString(),
      timeSpent: userRecords.totalTimeSpent,
      gameRecords: userRecords.gameRecords
        ? userRecords.gameRecords
            .reduce((acc: Array<string>, record: GameRecord) => {
              if (acc.includes(record.gameId)) {
                return acc;
              }
              return acc.concat([record.gameId]);
            }, [])
            .map(gameId => ({
              gameName: gameId,
              wins: userRecords.gameRecords.filter(
                record => record.gameId === gameId && record.win === true,
              ).length,
              losses: userRecords.gameRecords.filter(
                record => record.gameId === gameId && record.win === false,
              ).length,
            }))
        : [],
    };
  }
}
