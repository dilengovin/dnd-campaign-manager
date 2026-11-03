import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './session.guard';

/**
 * The id of the User whose Session this request carries. Only meaningful
 * behind `SessionGuard`, which is what puts it there.
 */
export const CurrentUserId = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<AuthenticatedRequest>().userId;
});
