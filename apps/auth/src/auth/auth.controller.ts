import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  signIn(@Body() signInUserDto: SignInUserDto) {
    return this.authService.signIn(signInUserDto);
  }

  @Post('2fa')
  twoFa(@Body() twoFaDto: { userId: string; code: string }) {
    return this.authService.twoFactor(twoFaDto);
  }
  @Post('create')
  createUser(@Body() createUserDto: any) {
    return this.authService.create(createUserDto);
  }
}
