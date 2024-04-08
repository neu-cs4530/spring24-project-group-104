import React from 'react';
import TownController from '../classes/TownController';
import { TownsService, UsersService } from '../generated/client';

export type LoginController = {
  setTownController: (newController: TownController | null) => void;
  townsService: TownsService;
  usersService: UsersService;
};
/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useLoginController` hook.
 */
const context = React.createContext<LoginController | null>(null);

export default context;
