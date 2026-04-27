-- FinTrack Database Schema
-- PostgreSQL

CREATE TABLE "Users" (
    "Id"           SERIAL PRIMARY KEY,
    "Name"         VARCHAR(100)  NOT NULL,
    "Email"        VARCHAR(150)  NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(255)  NOT NULL,
    "CreatedAt"    TIMESTAMP     NOT NULL DEFAULT NOW(),
    "DeletedAt"    TIMESTAMP     NULL
);

CREATE TABLE "Categories" (
    "Id"        SERIAL PRIMARY KEY,
    "UserId"    INT           NOT NULL REFERENCES "Users"("Id"),
    "Name"      VARCHAR(100)  NOT NULL,
    "Type"      VARCHAR(10)   NOT NULL CHECK ("Type" IN ('income', 'expense')),
    "IsDefault" BOOLEAN       NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP     NOT NULL DEFAULT NOW(),
    "DeletedAt" TIMESTAMP     NULL
);

CREATE TABLE "Transactions" (
    "Id"          SERIAL PRIMARY KEY,
    "UserId"      INT             NOT NULL REFERENCES "Users"("Id"),
    "CategoryId"  INT             NOT NULL REFERENCES "Categories"("Id"),
    "Amount"      DECIMAL(12, 2)  NOT NULL CHECK ("Amount" > 0),
    "Type"        VARCHAR(10)     NOT NULL CHECK ("Type" IN ('income', 'expense')),
    "Description" VARCHAR(255)    NULL,
    "Date"        DATE            NOT NULL,
    "CreatedAt"   TIMESTAMP       NOT NULL DEFAULT NOW(),
    "DeletedAt"   TIMESTAMP       NULL
);

CREATE TABLE "Budgets" (
    "Id"         SERIAL PRIMARY KEY,
    "UserId"     INT             NOT NULL REFERENCES "Users"("Id"),
    "CategoryId" INT             NOT NULL REFERENCES "Categories"("Id"),
    "Amount"     DECIMAL(12, 2)  NOT NULL CHECK ("Amount" > 0),
    "Month"      SMALLINT        NOT NULL CHECK ("Month" BETWEEN 1 AND 12),
    "Year"       SMALLINT        NOT NULL CHECK ("Year" >= 2000),
    "CreatedAt"  TIMESTAMP       NOT NULL DEFAULT NOW(),
    "DeletedAt"  TIMESTAMP       NULL,
    UNIQUE ("UserId", "CategoryId", "Month", "Year")
);

-- Default categories (seeded per user via application, this is just reference data)
-- When a user registers, the app inserts these categories with their UserId:
-- income:  Salário, Freelance, Investimentos, Outros
-- expense: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Outros
