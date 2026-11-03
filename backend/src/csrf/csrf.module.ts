import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard';
import { CsrfTokenMiddleware } from './csrf-token.middleware';

/**
 * The double-submit defence, the second of the two ADR-0003 describes. The
 * guard is registered globally rather than per-feature: a state-changing
 * endpoint that forgot to opt in would be exactly the hole this exists to
 * close. Every endpoint from ticket 04 onwards is therefore written against it
 * from its first line, with nothing to retrofit.
 */
@Module({
  providers: [{ provide: APP_GUARD, useClass: CsrfGuard }],
})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // `{*path}` rather than `*`: the bare wildcard is the Express 4 form that
    // Nest 11 only rewrites for compatibility.
    consumer.apply(CsrfTokenMiddleware).forRoutes('{*path}');
  }
}
