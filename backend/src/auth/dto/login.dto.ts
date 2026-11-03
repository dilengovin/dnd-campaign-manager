import { IsEmail, IsString, MaxLength } from 'class-validator';
import { PASSWORD_MAXIMUM_LENGTH } from './register.dto';

export class LoginDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  /**
   * The ceiling is here for the same reason it is on registration — argon2 is
   * not handed unbounded work by anyone who asks. The floor deliberately is
   * not: a minimum length is a rule about the password you may *choose*, and
   * applying it here would answer a short guess with a 400 where every other
   * wrong guess gets a 401, which is a second shape on the failure path for
   * no gain.
   */
  @IsString()
  @MaxLength(PASSWORD_MAXIMUM_LENGTH)
  password!: string;
}
