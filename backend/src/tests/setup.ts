// Setup file for Jest tests
import { jest } from '@jest/globals';

// Mock Prisma Client globally
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    candidate: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    education: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    workExperience: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    resume: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
  Prisma: {
    PrismaClientInitializationError: class extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'PrismaClientInitializationError';
      }
    },
  },
}));
