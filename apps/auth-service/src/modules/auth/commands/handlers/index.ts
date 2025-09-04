import { LoginHandler } from './login.handler';
import { LogoutHandler } from './logout.handler';
import { RefreshTokenHandler } from './refresh-token.handler';

export const AUTH_COMMAND_HANDLERS = [
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
];
