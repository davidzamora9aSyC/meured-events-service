import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { EventsService } from './events.service';
import { EventsController } from './controllers/events.controller';
import { RsvpController } from './controllers/rsvp.controller';

@Module({
  imports: [PrismaModule, RabbitmqModule],
  providers: [EventsService],
  controllers: [EventsController, RsvpController],
})
export class EventsModule {}
