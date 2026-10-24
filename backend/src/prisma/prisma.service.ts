import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  // No eager $connect: the client connects on its first query. That is what
  // lets the service boot with Postgres down and the health endpoint report it,
  // rather than the process dying before anything can be asked.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
