import { Controller, Post, UseGuards, Req, Get, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@db/entities/user.entity';

import { AuthService } from '@services/auth.service';
import { UsersService } from '@services/users.service';
import { Payload } from '@models/payload.model';
import { RefreshTokenDto } from '@dtos/auth.dto';
import { LocalAuthGuard } from '@guards/local-auth.guard';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { CreateUserDto } from '@dtos/user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // login(@Req() req: Request) {
  //   const user = req.user as User;
  //   return {
  //     access_token: this.authService.generateAccessToken(user),
  //     refresh_token: this.authService.generateRefreshToken(user),
  //   };
  // }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as User;
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      tokens: {
        access_token: this.authService.generateAccessToken(user),
        refresh_token: this.authService.generateRefreshToken(user),
      },
    };
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    const accessToken = this.authService.generateAccessToken(newUser);
    const refreshToken = this.authService.generateRefreshToken(newUser);
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        role: newUser.role,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  profile(@Req() req: Request) {
    const user = req.user as Payload;
    return this.usersService.findById(user?.userId);
  }

  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.generateAccessTokenByRefreshToken(dto.refreshToken);
  }
}
