import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
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

/**
 * An Email is "unique across the app" (CONTEXT.md), and case is not part of
 * what makes one Email a different one — the domain of an address is
 * case-insensitive by definition and no mail provider worth signing in to
 * treats the local part otherwise. Normalising on the way in is what stops
 * `Tasha@` and `tasha@` becoming two accounts contending for the same
 * Campaigns. The spec does not state a casing rule; this is the reading of
 * user story 24 that keeps its promise.
 */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Pays for the dummy hash at startup rather than on whichever sign-in
   * attempt happens to need it first. Computing it on demand would make that
   * one request cost a hash *and* a verify — roughly twice a wrong-password
   * attempt — which is the same timing signal this whole mechanism exists to
   * remove, just narrowed to one request per boot. A restart loop or a cold
   * instance is enough to make that repeatable.
   */
  async onModuleInit(): Promise<void> {
    await hashOfNobody();
  }

  async register(email: string, password: string): Promise<UserIdentity> {
    try {
      return await this.prisma.user.create({
        data: { email: normaliseEmail(email), passwordHash: await hashPassword(password) },
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
        throw new ConflictException('A User with that Email already exists. Sign in instead.');
      }

      throw error;
    }
  }

  /**
   * The User these credentials belong to, or nobody. A password that is wrong
   * and an Email that has no account behind it are the same answer, because
   * any difference between them turns the sign-in screen into a way of asking
   * which Emails are registered.
   */
  async authenticate(email: string, password: string): Promise<UserIdentity> {
    const user = await this.prisma.user.findUnique({
      where: { email: normaliseEmail(email) },
      select: { id: true, email: true, passwordHash: true },
    });

    // Verified unconditionally, against a hash of nothing when there is no
    // User. Returning early instead would skip argon2 entirely and answer in a
    // fraction of the time, and that gap is as good an answer to "is this
    // Email registered?" as a different status code would be — the responses
    // being identical is only half of the promise.
    const correct = await argon2.verify(user?.passwordHash ?? (await hashOfNobody()), password);

    if (!user || !correct) {
      throw new UnauthorizedException();
    }

    return { id: user.id, email: user.email };
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

/**
 * A hash for sign-in to spend its time on when the Email has no account. It is
 * produced by the same function as a real one so that verifying it costs the
 * same, and computed once and kept rather than generated per attempt. It is
 * warmed at startup by `onModuleInit`, so no sign-in attempt ever pays to
 * create it — doing that on demand would cost one request a hash *and* a
 * verify, which is the same timing signal narrowed to one request per boot.
 * What it is a hash of does not matter and is never compared to anything a
 * caller sends; only the work of verifying it does.
 */
let nobodysHash: Promise<string> | undefined;

function hashOfNobody(): Promise<string> {
  nobodysHash ??= hashPassword('no User has this password');
  return nobodysHash;
}
