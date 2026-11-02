import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, EventsModule],
  controllers: [HealthController],
})
export class AppModule {}

