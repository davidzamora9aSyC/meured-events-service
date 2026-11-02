CREATE SCHEMA IF NOT EXISTS "meured_events";

CREATE TYPE "meured_events"."MeuredEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELED', 'DELETED');
CREATE TYPE "meured_events"."MeuredRsvpStatus" AS ENUM ('GOING', 'INTERESTED');

CREATE TABLE "meured_events"."MeuredEvent" (
  "id" TEXT NOT NULL,
  "createdByAuthUserId" TEXT NOT NULL,
  "organizerEntityId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "status" "meured_events"."MeuredEventStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_events"."MeuredEventRsvp" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "authUserId" TEXT NOT NULL,
  "status" "meured_events"."MeuredRsvpStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredEventRsvp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MeuredEvent_createdByAuthUserId_idx" ON "meured_events"."MeuredEvent"("createdByAuthUserId");
CREATE INDEX "MeuredEvent_organizerEntityId_idx" ON "meured_events"."MeuredEvent"("organizerEntityId");
CREATE INDEX "MeuredEvent_startAt_idx" ON "meured_events"."MeuredEvent"("startAt");
CREATE INDEX "MeuredEvent_status_idx" ON "meured_events"."MeuredEvent"("status");

CREATE UNIQUE INDEX "MeuredEventRsvp_eventId_authUserId_key" ON "meured_events"."MeuredEventRsvp"("eventId","authUserId");
CREATE INDEX "MeuredEventRsvp_authUserId_idx" ON "meured_events"."MeuredEventRsvp"("authUserId");

ALTER TABLE "meured_events"."MeuredEventRsvp"
  ADD CONSTRAINT "MeuredEventRsvp_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "meured_events"."MeuredEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

