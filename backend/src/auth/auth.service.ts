import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

/** Prisma's code for a violated unique constraint. */
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

/**
 * What every endpoint says back about a User. The password hash is absent by
 * construction rather than deleted on the way out, so no future endpoint can
 * leak it by forgetting to strip it.
 */
export interface UserIdentity {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(email: string, password: string): Promise<UserIdentity> {
    try {
      return await this.prisma.user.create({
        data: { email, passwordHash: await hashPassword(password) },
        select: { id: true, email: true },
      });
    } catch (error) {
      // Caught from the insert rather than prevented by reading first: a check
      // before the write is a race two simultaneous registrations can both
      // pass. The constraint is the only thing that can actually decide this.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new ConflictException('An account with that email already exists. Sign in instead.');
      }

      throw error;
    }
  }

  /**
   * Who a User id belongs to. A Session can outlive the User it names — the
   * token stays valid for seven days and there is no revocation (ADR-0003) —
   * so a Session for an account that no longer exists is nobody.
   */
  async identify(userId: string): Promise<UserIdentity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

/**
 * argon2id, over bcrypt: it is the current recommendation and it has no silent
 * truncation of long inputs, which matters when the only rule we impose is
 * length. The defaults are the library's own tuning, deliberately not
 * hand-tuned here.
 */
function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}
