import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: 'ok'; database: 'up' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      // A green health response has to mean the whole path works, so an
      // unreachable database is a failed health check rather than a warning.
      // The cause goes to the log rather than the body: whoever is debugging
      // this has the log, and a caller is owed no detail about our database.
      this.logger.error('Health check could not reach Postgres', error);
      throw new ServiceUnavailableException('Database unreachable');
    }

    return { status: 'ok', database: 'up' };
  }
}
