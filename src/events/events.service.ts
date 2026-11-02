import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeuredContext } from './events.types';
import { CreateEventDto } from './dto/create-event.dto';
import { SetRsvpDto } from './dto/set-rsvp.dto';
import { RabbitPublisher } from '../rabbitmq/rabbitmq.publisher';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: RabbitPublisher,
  ) {}

  listEvents(_context: MeuredContext, params: { take: number }) {
    return this.prisma.meuredEvent.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { startAt: 'asc' },
      take: params.take,
    });
  }

  async getEvent(_context: MeuredContext, id: string) {
    const event = await this.prisma.meuredEvent.findUnique({ where: { id } });
    if (!event || event.status !== 'PUBLISHED') throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async createEvent(context: MeuredContext, dto: CreateEventDto) {
    const title = dto.title.trim();
    const description = dto.description.trim();
    if (!title || !description) throw new BadRequestException('title/description requeridos');

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (!(startAt instanceof Date) || Number.isNaN(startAt.getTime())) throw new BadRequestException('startAt invalido');
    if (!(endAt instanceof Date) || Number.isNaN(endAt.getTime())) throw new BadRequestException('endAt invalido');
    if (endAt <= startAt) throw new BadRequestException('endAt debe ser mayor a startAt');

    const event = await this.prisma.meuredEvent.create({
      data: {
        createdByAuthUserId: context.authUserId,
        organizerEntityId: dto.organizerEntityId ?? null,
        title,
        description,
        startAt,
        endAt,
        status: 'PUBLISHED',
      },
    });

    await this.publisher.publish('meured.events.event.created', {
      actorAuthUserId: context.authUserId,
      objectType: 'event',
      objectId: event.id,
      payload: {
        eventId: event.id,
        organizerEntityId: event.organizerEntityId,
        title: event.title,
        startAt: event.startAt.toISOString(),
      },
      occurredAt: event.createdAt.toISOString(),
    });

    return event;
  }

  getMyRsvp(context: MeuredContext, eventId: string) {
    return this.prisma.meuredEventRsvp.findUnique({
      where: { eventId_authUserId: { eventId, authUserId: context.authUserId } },
    });
  }

  async setMyRsvp(context: MeuredContext, eventId: string, dto: SetRsvpDto) {
    const event = await this.prisma.meuredEvent.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) throw new NotFoundException('Evento no encontrado');

    if (dto.status === 'NONE') {
      await this.prisma.meuredEventRsvp.deleteMany({ where: { eventId, authUserId: context.authUserId } });
      await this.publisher.publish('meured.events.rsvp.removed', {
        actorAuthUserId: context.authUserId,
        objectType: 'eventRsvp',
        objectId: `${eventId}:${context.authUserId}`,
        payload: { eventId, status: 'NONE' },
        occurredAt: new Date().toISOString(),
      });
      return { ok: true, status: 'NONE' };
    }

    const rsvp = await this.prisma.meuredEventRsvp.upsert({
      where: { eventId_authUserId: { eventId, authUserId: context.authUserId } },
      create: { eventId, authUserId: context.authUserId, status: dto.status },
      update: { status: dto.status },
    });

    await this.publisher.publish('meured.events.rsvp.set', {
      actorAuthUserId: context.authUserId,
      objectType: 'eventRsvp',
      objectId: rsvp.id,
      payload: { eventId, status: rsvp.status },
      occurredAt: rsvp.createdAt.toISOString(),
    });
    return { ok: true, rsvp };
  }
}
