-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "imageUrl" TEXT,
    "storageInMB" INTEGER NOT NULL DEFAULT 0,
    "zoomAccessToken" TEXT,
    "zoomRefreshToken" TEXT,
    "zoomUserId" TEXT,
    "zoomTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "location" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inPersonDetails" JSONB,
    "phoneDetails" JSONB,
    "theme" TEXT,
    "background" TEXT,
    "questions" JSONB,
    "redirecturl" TEXT,
    "confPageSelection" TEXT,
    "confirmationPageText" TEXT,
    "allowGuest" BOOLEAN NOT NULL DEFAULT true,
    "addFirstLastName" BOOLEAN NOT NULL DEFAULT false,
    "introVideoLink" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "email" TEXT,
    "location" TEXT,
    "suggestedLocation" TEXT,
    "phoneNumber" TEXT,
    "askInvitee" TEXT,
    "timezone" TEXT,
    "addGuestEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customQAnswers" JSONB,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "meetLink" TEXT,
    "googleEventId" TEXT,
    "zoomLink" TEXT,
    "zoomMeetingId" TEXT,
    "zoomMeetingUrl" TEXT,
    "zoomMeetingPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timeGap" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayAvailability" (
    "id" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DateOverride" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "availabilityId" TEXT NOT NULL,

    CONSTRAINT "DateOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT,
    "availabilityId" TEXT NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "availabilityId" TEXT,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailConfig" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "replyTo" TEXT NOT NULL DEFAULT 'host',
    "confirmationSubject" TEXT,
    "confirmationBody" TEXT,
    "confirmationCancellationPolicy" TEXT,
    "confirmationIncludeCancelLinks" BOOLEAN NOT NULL DEFAULT true,
    "cancellationSubject" TEXT,
    "cancellationBody" TEXT,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderSubject" TEXT,
    "reminderBody" TEXT,
    "reminderTimings" INTEGER[] DEFAULT ARRAY[24]::INTEGER[],
    "reminderCancellationPolicy" TEXT,
    "reminderIncludeCancelLinks" BOOLEAN NOT NULL DEFAULT true,
    "followupEnabled" BOOLEAN NOT NULL DEFAULT false,
    "followupSubject" TEXT,
    "followupBody" TEXT,
    "followupTimings" INTEGER[] DEFAULT ARRAY[24]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_scheduleId_idx" ON "Event"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_userId_key" ON "Availability"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DateOverride_availabilityId_date_key" ON "DateOverride"("availabilityId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_availabilityId_date_key" ON "Holiday"("availabilityId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_availabilityId_key" ON "Schedule"("availabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_userId_name_key" ON "Schedule"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfig_eventId_key" ON "EmailConfig"("eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayAvailability" ADD CONSTRAINT "DayAvailability_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DateOverride" ADD CONSTRAINT "DateOverride_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConfig" ADD CONSTRAINT "EmailConfig_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
