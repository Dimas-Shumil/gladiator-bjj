-- Clean baseline, no records.

CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, "lastLoginAt" DATETIME, "gymId" TEXT REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE);

CREATE TABLE "Session" (
    "sid" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "parent" TEXT NOT NULL DEFAULT '',
    "start" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT '',
    "trainer" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
, "gymId" TEXT REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE, "deletedAt" DATETIME);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "received" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL, "deletedAt" DATETIME,
    CONSTRAINT "Payment_student_fkey" FOREIGN KEY ("student") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PaymentRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "before" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentRevision_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "News" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payload" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
, "slug" TEXT, "publishedPayload" TEXT, "publishedOn" DATETIME);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, "gymId" TEXT);

CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "csrfTokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "NewsAsset" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "newsId" TEXT NOT NULL,
 "size" INTEGER NOT NULL,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "NewsAsset_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Person" (
 "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'draft',
 "payload" TEXT NOT NULL, "publishedPayload" TEXT, "slug" TEXT, "version" INTEGER NOT NULL DEFAULT 1,
 "publishedOn" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "PersonAsset" (
 "id" TEXT NOT NULL PRIMARY KEY, "personId" TEXT NOT NULL, "size" INTEGER NOT NULL,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "PersonAsset_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Competition" (
 "id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'draft',
 "payload" TEXT NOT NULL, "publishedPayload" TEXT, "slug" TEXT, "version" INTEGER NOT NULL DEFAULT 1,
 "publishedOn" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "CompetitionAsset" (
 "id" TEXT NOT NULL PRIMARY KEY, "competitionId" TEXT NOT NULL, "size" INTEGER NOT NULL, "kind" TEXT NOT NULL,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "CompetitionAsset_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "HistoryMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payload" TEXT NOT NULL,
    "publishedPayload" TEXT,
    "slug" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedOn" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "HistoryAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoryAsset_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "HistoryMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SiteAsset" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "ownerKey" TEXT NOT NULL,
 "kind" TEXT NOT NULL,
 "size" INTEGER NOT NULL,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "TrainingGroup" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "trainer" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'active',
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
, "gymId" TEXT REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE, "deletedAt" DATETIME);

CREATE TABLE "GymSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "groupId" TEXT,
  "title" TEXT NOT NULL,
  "heldOn" TEXT NOT NULL,
  "startsAt" TEXT NOT NULL,
  "endsAt" TEXT NOT NULL,
  "trainer" TEXT NOT NULL DEFAULT '',
  "note" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'planned',
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL, "gymId" TEXT REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "GymSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TrainingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "AttendanceRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GymSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "FederationDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payload" TEXT NOT NULL,
    "publishedPayload" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedOn" DATETIME
);

CREATE TABLE "SitePage" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "publishedPayload" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedOn" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Gym" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gymId" TEXT,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "occurredOn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinanceEntry_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

CREATE INDEX "Session_expires_idx" ON "Session"("expires");

CREATE INDEX "Payment_received_idx" ON "Payment"("received");

CREATE INDEX "Payment_student_period_idx" ON "Payment"("student", "period");

CREATE INDEX "AuditLog_scope_createdAt_idx" ON "AuditLog"("scope", "createdAt");

CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

CREATE INDEX "AdminSession_adminId_idx" ON "AdminSession"("adminId");

CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

CREATE UNIQUE INDEX "Person_slug_key" ON "Person"("slug");

CREATE UNIQUE INDEX "Competition_slug_key" ON "Competition"("slug");

CREATE UNIQUE INDEX "HistoryMaterial_slug_key" ON "HistoryMaterial"("slug");

CREATE INDEX "HistoryAsset_materialId_idx" ON "HistoryAsset"("materialId");

CREATE INDEX "SiteAsset_ownerKey_idx" ON "SiteAsset"("ownerKey");

CREATE INDEX "GymSession_heldOn_idx" ON "GymSession"("heldOn");

CREATE INDEX "GymSession_groupId_heldOn_idx" ON "GymSession"("groupId","heldOn");

CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON "AttendanceRecord"("sessionId","studentId");

CREATE INDEX "AttendanceRecord_studentId_idx" ON "AttendanceRecord"("studentId");

CREATE UNIQUE INDEX "TrainingGroup_gymId_name_key" ON "TrainingGroup"("gymId", "name");

CREATE INDEX "Student_gymId_idx" ON "Student"("gymId");

CREATE INDEX "TrainingGroup_gymId_idx" ON "TrainingGroup"("gymId");

CREATE INDEX "GymSession_gymId_idx" ON "GymSession"("gymId");

CREATE INDEX "FinanceEntry_gymId_occurredOn_idx" ON "FinanceEntry"("gymId", "occurredOn");

CREATE INDEX "AuditLog_gymId_createdAt_idx" ON "AuditLog"("gymId", "createdAt");
