import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * The floor does the real work; there are no composition rules on purpose.
 * Requiring a symbol or a capital pushes people toward short, predictable
 * shapes, where a long memorable passphrase is the thing actually worth
 * encouraging. The ceiling is not about password strength at all — it is so
 * argon2 cannot be handed an unbounded input to chew on.
 */
export const PASSWORD_MINIMUM_LENGTH = 8;
export const PASSWORD_MAXIMUM_LENGTH = 128;

export class RegisterDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(PASSWORD_MINIMUM_LENGTH)
  @MaxLength(PASSWORD_MAXIMUM_LENGTH)
  password!: string;
}
