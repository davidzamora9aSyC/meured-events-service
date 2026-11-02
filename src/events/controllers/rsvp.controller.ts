import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { EventsService } from '../events.service';
import { getMeuredContext } from '../events.types';
import { SetRsvpDto } from '../dto/set-rsvp.dto';

@Controller('events/:eventId/rsvp')
export class RsvpController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('me')
  me(@Headers() headers: Record<string, string | undefined>, @Param('eventId') eventId: string) {
    return this.eventsService.getMyRsvp(this.context(headers), eventId);
  }

  @Post('me')
  set(
    @Headers() headers: Record<string, string | undefined>,
    @Param('eventId') eventId: string,
    @Body() dto: SetRsvpDto,
  ) {
    return this.eventsService.setMyRsvp(this.context(headers), eventId, dto);
  }

  private context(headers: Record<string, string | undefined>) {
    try {
      const context = getMeuredContext(headers);
      if (context.activeProduct !== 'MEURED') throw new Error('Acceso MeuRed requerido');
      return context;
    } catch {
      throw new UnauthorizedException('Contexto MeuRed requerido');
    }
  }
}

