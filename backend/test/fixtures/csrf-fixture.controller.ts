import { Controller, Get, Post } from '@nestjs/common';

/**
 * A pair of routes that exist only so the CSRF guard has something to guard.
 *
 * The guard lands before any real endpoint does, which leaves it nothing real
 * to protect — so verification uses this controller, registered by the testing
 * module alone and never by `AppModule`. From ticket 04 onwards the guard is
 * exercised by the actual authentication routes and this fixture stays as the
 * one place that proves the guard's own rules in isolation.
 */
@Controller('fixture')
export class CsrfFixtureController {
  @Get()
  read(): { read: true } {
    return { read: true };
  }

  @Post()
  write(): { written: true } {
    return { written: true };
  }
}
