import { Body, Controller, Get, Headers, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import { EventsService } from '../events.service';
import { getMeuredContext } from '../events.types';
import { CreateEventDto } from '../dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  list(@Headers() headers: Record<string, string | undefined>, @Query('take') takeRaw?: string) {
    const take = Math.max(1, Math.min(parseInt(takeRaw ?? '20', 10) || 20, 50));
    return this.eventsService.listEvents(this.context(headers), { take });
  }

  @Get(':id')
  get(@Headers() headers: Record<string, string | undefined>, @Param('id') id: string) {
    return this.eventsService.getEvent(this.context(headers), id);
  }

  @Post()
  create(@Headers() headers: Record<string, string | undefined>, @Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(this.context(headers), dto);
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

