import { nanoid } from 'nanoid';
import { User } from '@prisma/client';
import { Player as PlayerModel, PlayerLocation, TownEmitter } from '../types/CoveyTownSocket';
import { prisma } from '../Utils';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class Player {
  /** The current location of this user in the world map * */
  public location: PlayerLocation;

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the town * */
  private readonly _userName: string;

  /** The secret token that allows this client to access our Covey.Town service for this town * */
  private readonly _sessionToken: string;

  /** The secret token that allows this client to access our video resources for this town * */
  private _videoToken?: string;

  /** A special town emitter that will emit events to the entire town BUT NOT to this player */
  public readonly townEmitter: TownEmitter;

  constructor(userName: string, townEmitter: TownEmitter, uid: string = nanoid()) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = userName;
    this._id = uid;
    this._sessionToken = nanoid();
    this.townEmitter = townEmitter;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  set videoToken(value: string | undefined) {
    this._videoToken = value;
  }

  get videoToken(): string | undefined {
    return this._videoToken;
  }

  get sessionToken(): string {
    return this._sessionToken;
  }

  toPlayerModel(): PlayerModel {
    return {
      id: this._id,
      location: this.location,
      userName: this._userName,
    };
  }

  async registerPlayerInDatabase(): Promise<User> {
    return prisma.user
      .findFirst({
        where: {
          id: this.id,
        },
      })
      .then(res => {
        if (res) {
          return prisma.user.update({
            where: {
              id: this.id,
            },
            data: {
              lastLogin: new Date(),
            },
          });
        }
        return prisma.user.create({
          data: {
            id: this.id,
            displayName: this.userName,
            lastLogin: new Date(),
          },
        });
      });
  }
}
