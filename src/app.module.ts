import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { JwtMiddleware } from '@common/middleware/jwt.middleware';
import { JwtAuthGuard } from '@common/guards/jwtAuth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.get<number>('THROTTLE_SHORT_TTL', 1000),
            limit: configService.get<number>('THROTTLE_SHORT_LIMIT', 3),
          },
          {
            name: 'medium',
            ttl: configService.get<number>('THROTTLE_MEDIUM_TTL', 10000),
            limit: configService.get<number>('THROTTLE_MEDIUM_LIMIT', 20),
          },
          {
            name: 'long',
            ttl: configService.get<number>('THROTTLE_LONG_TTL', 60000),
            limit: configService.get<number>('THROTTLE_LONG_LIMIT', 100),
          },
        ],
      }),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
