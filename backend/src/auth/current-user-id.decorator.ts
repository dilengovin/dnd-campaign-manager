import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './session.guard';

/**
 * The id of the User whose Session this request carries. Only meaningful
 * behind `SessionGuard`, which is what puts it there.
 */
export const CurrentUserId = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  // Non-null because the guard refuses the request outright when there is no
  // Session, so a handler using this decorator is never reached without one.
  return context.switchToHttp().getRequest<AuthenticatedRequest>().userId!;
});
