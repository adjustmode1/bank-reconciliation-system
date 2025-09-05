import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenInformationResponse } from '../responses/refresh-token-information.response';

interface AuthenticatedRequest extends Request {
  user: RefreshTokenInformationResponse;
}

export const GetUser = createParamDecorator(
  (
    data: keyof RefreshTokenInformationResponse | undefined,
    ctx: ExecutionContext,
  ): any => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
