import { Controller, Route, Tags, Get, Header, Path, Response } from 'tsoa';
import { GameRecord } from '@prisma/client';
import InvalidParametersError from '../lib/InvalidParametersError';
import { UserStats } from '../types/CoveyTownSocket';
import { prisma } from '../Utils';
import TownsStore from '../lib/TownsStore';
import { TownVisit } from '../api/Model';

/**
 * This is the town route
 */
@Route('users')
@Tags('users')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class UsersController extends Controller {
  private _townsStore: TownsStore = TownsStore.getInstance();

  @Get('{userID}/recentlyVisitedTowns')
  @Response<InvalidParametersError>(400, 'Invalid values Specified')
  public async listRecentlyVistedTowns(@Path() userID: string): Promise<TownVisit[]> {
    // I don't know why this has to be findMany, but findUnique doesn't work
    const userRecords = await prisma.user.findMany({
      where: {
        id: userID,
      },
      include: {
        townVisits: true,
      },
    });
    if (userRecords.length === 0) {
      return [];
    }
    const currentActiveTownIDs = this._townsStore.getTowns().map(town => town.townID);
    const out = userRecords[0].townVisits
      .filter(visit => currentActiveTownIDs.indexOf(visit.townId) !== -1)
      .map(visit => ({ townId: visit.townId, lastVisited: visit.visitedAt }));
    return out;
  }

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
