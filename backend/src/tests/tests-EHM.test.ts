import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock de Prisma Client
const mockCreate = jest.fn() as jest.MockedFunction<any>;
const mockUpdate = jest.fn() as jest.MockedFunction<any>;
const mockFindUnique = jest.fn() as jest.MockedFunction<any>;

// Mock de las clases de dominio
const mockEducationSave = jest.fn() as jest.MockedFunction<any>;
const mockWorkExperienceSave = jest.fn() as jest.MockedFunction<any>;
const mockResumeSave = jest.fn() as jest.MockedFunction<any>;

// Mock modules ANTES de los imports
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    candidate: {
      create: mockCreate,
      update: mockUpdate,
      findUnique: mockFindUnique,
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

jest.mock('../domain/models/Education', () => ({
  Education: jest.fn().mockImplementation((data: any) => {
    const mockInstance = {
      institution: data?.institution,
      title: data?.title,
      startDate: data?.startDate,
      endDate: data?.endDate,
      candidateId: undefined,
      save: mockEducationSave,
    };
    // Asegurar que la propiedad candidateId se puede asignar
    Object.defineProperty(mockInstance, 'candidateId', {
      writable: true,
      value: undefined
    });
    return mockInstance;
  }),
}));

jest.mock('../domain/models/WorkExperience', () => ({
  WorkExperience: jest.fn().mockImplementation((data: any) => {
    const mockInstance = {
      company: data?.company,
      position: data?.position,
      description: data?.description,
      startDate: data?.startDate,
      endDate: data?.endDate,
      candidateId: undefined,
      save: mockWorkExperienceSave,
    };
    Object.defineProperty(mockInstance, 'candidateId', {
      writable: true,
      value: undefined
    });
    return mockInstance;
  }),
}));

jest.mock('../domain/models/Resume', () => ({
  Resume: jest.fn().mockImplementation((data: any) => {
    const mockInstance = {
      filePath: data?.filePath,
      fileType: data?.fileType,
      candidateId: undefined,
      save: mockResumeSave,
    };
    Object.defineProperty(mockInstance, 'candidateId', {
      writable: true,
      value: undefined
    });
    return mockInstance;
  }),
}));

// Ahora importamos después de los mocks
import { Candidate } from '../domain/models/Candidate';
import { addCandidate } from '../application/services/candidateService';
import { validateCandidateData } from '../application/validator';

describe('Candidate Database Insertion Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Candidate Model - save() method', () => {
    describe('Creating new candidates', () => {
      it('should successfully create a candidate with only required fields', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@email.com',
        };

        const expectedResult = {
          id: 1,
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@email.com',
          phone: null,
          address: null,
        };

        mockCreate.mockResolvedValue(expectedResult);

        // Act
        const candidate = new Candidate(candidateData);
        const result = await candidate.save();

        // Assert
        expect(mockCreate).toHaveBeenCalledWith({
          data: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@email.com',
          },
        });
        expect(result).toEqual(expectedResult);
      });

      it('should successfully create a candidate with all fields', async () => {
        // Arrange
        const candidateData = {
          firstName: 'María',
          lastName: 'González',
          email: 'maria.gonzalez@email.com',
          phone: '612345678',
          address: 'Calle Falsa 123, Madrid',
        };

        const expectedResult = {
          id: 2,
          ...candidateData,
        };

        mockCreate.mockResolvedValue(expectedResult);

        // Act
        const candidate = new Candidate(candidateData);
        const result = await candidate.save();

        // Assert
        expect(mockCreate).toHaveBeenCalledWith({
          data: candidateData,
        });
        expect(result).toEqual(expectedResult);
      });

      it('should create a candidate with education data', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Carlos',
          lastName: 'Ruiz',
          email: 'carlos.ruiz@email.com',
          education: [
            {
              institution: 'Universidad Complutense',
              title: 'Ingeniería Informática',
              startDate: '2018-09-01',
              endDate: '2022-06-30',
            },
          ],
        };

        const expectedResult = {
          id: 3,
          firstName: 'Carlos',
          lastName: 'Ruiz',
          email: 'carlos.ruiz@email.com',
          phone: null,
          address: null,
        };

        mockCreate.mockResolvedValue(expectedResult);

        // Act
        const candidate = new Candidate(candidateData);
        const result = await candidate.save();

        // Assert
        expect(mockCreate).toHaveBeenCalledWith({
          data: {
            firstName: 'Carlos',
            lastName: 'Ruiz',
            email: 'carlos.ruiz@email.com',
            educations: {
              create: [
                {
                  institution: 'Universidad Complutense',
                  title: 'Ingeniería Informática',
                  startDate: '2018-09-01',
                  endDate: '2022-06-30',
                },
              ],
            },
          },
        });
        expect(result).toEqual(expectedResult);
      });

      it('should create a candidate with work experience data', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Ana',
          lastName: 'López',
          email: 'ana.lopez@email.com',
          workExperience: [
            {
              company: 'Tech Corp',
              position: 'Desarrolladora Frontend',
              description: 'Desarrollo de aplicaciones React',
              startDate: '2022-01-15',
              endDate: '2024-12-31',
            },
          ],
        };

        const expectedResult = {
          id: 4,
          firstName: 'Ana',
          lastName: 'López',
          email: 'ana.lopez@email.com',
          phone: null,
          address: null,
        };

        mockCreate.mockResolvedValue(expectedResult);

        // Act
        const candidate = new Candidate(candidateData);
        const result = await candidate.save();

        // Assert
        expect(mockCreate).toHaveBeenCalledWith({
          data: {
            firstName: 'Ana',
            lastName: 'López',
            email: 'ana.lopez@email.com',
            workExperiences: {
              create: [
                {
                  company: 'Tech Corp',
                  position: 'Desarrolladora Frontend',
                  description: 'Desarrollo de aplicaciones React',
                  startDate: '2022-01-15',
                  endDate: '2024-12-31',
                },
              ],
            },
          },
        });
        expect(result).toEqual(expectedResult);
      });

      it('should create a candidate with resume data', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Pedro',
          lastName: 'Martín',
          email: 'pedro.martin@email.com',
          resumes: [
            {
              filePath: '/uploads/pedro-martin-cv.pdf',
              fileType: 'application/pdf',
            },
          ],
        };

        const expectedResult = {
          id: 5,
          firstName: 'Pedro',
          lastName: 'Martín',
          email: 'pedro.martin@email.com',
          phone: null,
          address: null,
        };

        mockCreate.mockResolvedValue(expectedResult);

        // Act
        const candidate = new Candidate(candidateData);
        const result = await candidate.save();

        // Assert
        expect(mockCreate).toHaveBeenCalledWith({
          data: {
            firstName: 'Pedro',
            lastName: 'Martín',
            email: 'pedro.martin@email.com',
            resumes: {
              create: [
                {
                  filePath: '/uploads/pedro-martin-cv.pdf',
                  fileType: 'application/pdf',
                },
              ],
            },
          },
        });
        expect(result).toEqual(expectedResult);
      });

      it('should create a candidate with complete data (education, work experience, and resume)', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Laura',
          lastName: 'Fernández',
          email: 'laura.fernandez@email.com',
          phone: '654321987',
          address: 'Avenida de la Paz 456, Barcelona',
          education: [
            {
              institution: 'Universidad Politécnica',
              title: 'Máster en Desarrollo Web',
              startDate: '2020-09-01',
              endDate: '2022-06-30',
            },
          ],
          workExperience: [
            {
              company: 'StartupXYZ',
              position: 'Full Stack Developer',
              description: 'Desarrollo de aplicaciones web completas',
              startDate: '2022-07-01',
              endDate: '2024-12-31',
            },
          ],
          resumes: [
            {
              filePath: '/uploads/laura-fernandez-cv.pdf',
              fileType: 'application/pdf',
            },
          ],
        };

        const expectedResult = {
          id: 6,
          firstName: 'Laura',
          lastName: 'Fernández',
          email: 'laura.fernandez@email.com',
          phone: '654321987',
          address: 'Avenida de la Paz 456, Barcelona',
        };

        mockCreate.mockResolvedValue(expectedResult);

        // Act
        const candidate = new Candidate(candidateData);
        const result = await candidate.save();

        // Assert
        expect(mockCreate).toHaveBeenCalledWith({
          data: {
            firstName: 'Laura',
            lastName: 'Fernández',
            email: 'laura.fernandez@email.com',
            phone: '654321987',
            address: 'Avenida de la Paz 456, Barcelona',
            educations: {
              create: [
                {
                  institution: 'Universidad Politécnica',
                  title: 'Máster en Desarrollo Web',
                  startDate: '2020-09-01',
                  endDate: '2022-06-30',
                },
              ],
            },
            workExperiences: {
              create: [
                {
                  company: 'StartupXYZ',
                  position: 'Full Stack Developer',
                  description: 'Desarrollo de aplicaciones web completas',
                  startDate: '2022-07-01',
                  endDate: '2024-12-31',
                },
              ],
            },
            resumes: {
              create: [
                {
                  filePath: '/uploads/laura-fernandez-cv.pdf',
                  fileType: 'application/pdf',
                },
              ],
            },
          },
        });
        expect(result).toEqual(expectedResult);
      });
    });

    describe('Error handling in candidate creation', () => {
      it('should handle database connection errors', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@email.com',
        };

        const { Prisma } = await import('@prisma/client');
        const prismaError = new Prisma.PrismaClientInitializationError(
          'Database connection failed',
          'version',
          'errorCode'
        );

        mockCreate.mockRejectedValue(prismaError);

        // Act & Assert
        const candidate = new Candidate(candidateData);
        await expect(candidate.save()).rejects.toThrow(
          'Database connection failed'
        );
      });

      it('should handle unique constraint violations (duplicate email)', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Duplicate',
          lastName: 'Email',
          email: 'duplicate@email.com',
        };

        const prismaError = new Error('Unique constraint failed on the fields: (`email`)');
        (prismaError as any).code = 'P2002';

        mockCreate.mockRejectedValue(prismaError);

        // Act & Assert
        const candidate = new Candidate(candidateData);
        await expect(candidate.save()).rejects.toThrow('Unique constraint failed on the fields: (`email`)');
      });

      it('should handle general database errors', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Error',
          lastName: 'Test',
          email: 'error@email.com',
        };

        const genericError = new Error('Database constraint violation');
        mockCreate.mockRejectedValue(genericError);

        // Act & Assert
        const candidate = new Candidate(candidateData);
        await expect(candidate.save()).rejects.toThrow('Database constraint violation');
      });
    });

    describe('Updating existing candidates', () => {
      it('should successfully update an existing candidate', async () => {
        // Arrange
        const candidateData = {
          id: 1,
          firstName: 'Juan Updated',
          lastName: 'Pérez Updated',
          email: 'juan.updated@email.com',
        };

        const expectedResult = {
          id: 1,
          firstName: 'Juan Updated',
          lastName: 'Pérez Updated',
          email: 'juan.updated@email.com',
          phone: null,
          address: null,
        };

        mockUpdate.mockResolvedValue(expectedResult);

        // Act
        const candidate = new Candidate(candidateData);
        const result = await candidate.save();

        // Assert
        expect(mockUpdate).toHaveBeenCalledWith({
          where: { id: 1 },
          data: {
            firstName: 'Juan Updated',
            lastName: 'Pérez Updated',
            email: 'juan.updated@email.com',
          },
        });
        expect(result).toEqual(expectedResult);
      });

      it('should handle record not found errors when updating', async () => {
        // Arrange
        const candidateData = {
          id: 999,
          firstName: 'Non Existing',
          lastName: 'Candidate',
          email: 'nonexisting@email.com',
        };

        const prismaError = {
          code: 'P2025',
          message: 'Record to update not found.',
        };

        mockUpdate.mockRejectedValue(prismaError);

        // Act & Assert
        const candidate = new Candidate(candidateData);
        await expect(candidate.save()).rejects.toThrow(
          'No se pudo encontrar el registro del candidato con el ID proporcionado.'
        );
      });

      it('should handle database connection errors when updating', async () => {
        // Arrange
        const candidateData = {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test@email.com',
        };

        const { Prisma } = await import('@prisma/client');
        const prismaError = new Prisma.PrismaClientInitializationError(
          'Database connection failed',
          'version',
          'errorCode'
        );

        mockUpdate.mockRejectedValue(prismaError);

        // Act & Assert
        const candidate = new Candidate(candidateData);
        await expect(candidate.save()).rejects.toThrow(
          'Database connection failed'
        );
      });
    });
  });

  describe('CandidateService - addCandidate() function', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
      mockEducationSave.mockResolvedValue(undefined);
      mockWorkExperienceSave.mockResolvedValue(undefined);
      mockResumeSave.mockResolvedValue(undefined);
    });

    it.skip('should successfully add a candidate with all related data', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Service',
        lastName: 'Test',
        email: 'service.test@email.com',
        phone: '612345678',
        address: 'Test Address',
        educations: [
          {
            institution: 'Test University',
            title: 'Test Degree',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
          },
        ],
        workExperiences: [
          {
            company: 'Test Company',
            position: 'Test Position',
            description: 'Test Description',
            startDate: '2024-01-01',
            endDate: '2025-01-01',
          },
        ],
        cv: {
          filePath: '/uploads/test-cv.pdf',
          fileType: 'application/pdf',
        },
      };

      const mockSavedCandidate = {
        id: 7,
        firstName: 'Service',
        lastName: 'Test',
        email: 'service.test@email.com',
        phone: '612345678',
        address: 'Test Address',
      };

      mockCreate.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(mockCreate).toHaveBeenCalled();
      expect(mockEducationSave).toHaveBeenCalled();
      expect(mockWorkExperienceSave).toHaveBeenCalled();
      expect(mockResumeSave).toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidCandidateData = {
        firstName: '', // Invalid name
        lastName: 'Test',
        email: 'invalid-email', // Invalid email
      };

      // Act & Assert
      await expect(addCandidate(invalidCandidateData)).rejects.toThrow();
    });

    it('should handle duplicate email errors from service', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Duplicate',
        lastName: 'Email',
        email: 'duplicate@email.com',
      };

      const prismaError = {
        code: 'P2002',
        message: 'Unique constraint failed on the fields: (`email`)',
      };

      mockCreate.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow(
        'The email already exists in the database'
      );
    });

    it('should handle general errors from candidate save', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Error',
        lastName: 'Test',
        email: 'error@email.com',
      };

      const genericError = new Error('Database error');
      mockCreate.mockRejectedValue(genericError);

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow('Database error');
    });

    it('should add candidate without optional relationships', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Simple',
        lastName: 'Candidate',
        email: 'simple@email.com',
      };

      const mockSavedCandidate = {
        id: 8,
        firstName: 'Simple',
        lastName: 'Candidate',
        email: 'simple@email.com',
        phone: null,
        address: null,
      };

      mockCreate.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(mockCreate).toHaveBeenCalled();
      expect(mockEducationSave).not.toHaveBeenCalled();
      expect(mockWorkExperienceSave).not.toHaveBeenCalled();
      expect(mockResumeSave).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });
  });

  describe('Validator Tests for Database Constraints', () => {
    describe('validateCandidateData', () => {
      it('should validate candidate data successfully with all required fields', () => {
        // Arrange
        const validData = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          phone: '612345678',
          address: 'Valid Address',
        };

        // Act & Assert
        expect(() => validateCandidateData(validData)).not.toThrow();
      });

      it('should throw error for invalid name (empty)', () => {
        // Arrange
        const invalidData = {
          firstName: '',
          lastName: 'User',
          email: 'valid@email.com',
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
      });

      it('should throw error for invalid name (special characters)', () => {
        // Arrange
        const invalidData = {
          firstName: 'Invalid123',
          lastName: 'User',
          email: 'valid@email.com',
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
      });

      it('should throw error for invalid email format', () => {
        // Arrange
        const invalidData = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'invalid-email',
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid email');
      });

      it('should throw error for invalid phone format', () => {
        // Arrange
        const invalidData = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          phone: '123456789', // Should start with 6, 7, or 9
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid phone');
      });

      it('should validate education data correctly', () => {
        // Arrange
        const dataWithEducation = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          educations: [
            {
              institution: 'Valid University',
              title: 'Valid Degree',
              startDate: '2020-01-01',
              endDate: '2024-01-01',
            },
          ],
        };

        // Act & Assert
        expect(() => validateCandidateData(dataWithEducation)).not.toThrow();
      });

      it('should throw error for invalid education institution', () => {
        // Arrange
        const invalidData = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          educations: [
            {
              institution: '', // Empty institution
              title: 'Valid Degree',
              startDate: '2020-01-01',
            },
          ],
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid institution');
      });

      it('should throw error for invalid education date format', () => {
        // Arrange
        const invalidData = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          educations: [
            {
              institution: 'Valid University',
              title: 'Valid Degree',
              startDate: '01/01/2020', // Wrong format
            },
          ],
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid date');
      });

      it('should validate work experience data correctly', () => {
        // Arrange
        const dataWithExperience = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          workExperiences: [
            {
              company: 'Valid Company',
              position: 'Valid Position',
              description: 'Valid Description',
              startDate: '2020-01-01',
              endDate: '2024-01-01',
            },
          ],
        };

        // Act & Assert
        expect(() => validateCandidateData(dataWithExperience)).not.toThrow();
      });

      it('should throw error for invalid work experience company', () => {
        // Arrange
        const invalidData = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          workExperiences: [
            {
              company: '', // Empty company
              position: 'Valid Position',
              startDate: '2020-01-01',
            },
          ],
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid company');
      });

      it('should validate CV data correctly', () => {
        // Arrange
        const dataWithCV = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          cv: {
            filePath: '/valid/path/cv.pdf',
            fileType: 'application/pdf',
          },
        };

        // Act & Assert
        expect(() => validateCandidateData(dataWithCV)).not.toThrow();
      });

      it('should throw error for invalid CV data', () => {
        // Arrange
        const invalidData = {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          cv: {
            filePath: '', // Empty file path
            fileType: 'application/pdf',
          },
        };

        // Act & Assert
        expect(() => validateCandidateData(invalidData)).toThrow('Invalid CV data');
      });

      it('should skip validation for existing candidates (with id)', () => {
        // Arrange
        const dataWithId = {
          id: 1,
          firstName: '', // This would normally fail validation
          email: 'invalid-email', // This would normally fail validation
        };

        // Act & Assert
        expect(() => validateCandidateData(dataWithId)).not.toThrow();
      });
    });
  });

  describe('Data Integration Tests', () => {
    it.skip('should process complete candidate data flow', async () => {
      // Arrange
      const completeData = {
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration@email.com',
        phone: '612345678',
        address: 'Integration Test Address',
        educations: [
          {
            institution: 'Integration University',
            title: 'Computer Science',
            startDate: '2018-09-01',
            endDate: '2022-06-30',
          },
        ],
        workExperiences: [
          {
            company: 'Integration Corp',
            position: 'Software Developer',
            description: 'Full stack development',
            startDate: '2022-07-01',
            endDate: '2024-12-31',
          },
        ],
        cv: {
          filePath: '/uploads/integration-test.pdf',
          fileType: 'application/pdf',
        },
      };

      const mockSavedCandidate = {
        id: 100,
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration@email.com',
        phone: '612345678',
        address: 'Integration Test Address',
      };

      mockCreate.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(completeData);

      // Assert
      expect(result).toEqual(mockSavedCandidate);
      expect(mockCreate).toHaveBeenCalled();
      expect(mockEducationSave).toHaveBeenCalled();
      expect(mockWorkExperienceSave).toHaveBeenCalled();
      expect(mockResumeSave).toHaveBeenCalled();
    });

    it('should handle database transaction failures gracefully', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Transaction',
        lastName: 'Error',
        email: 'transaction@email.com',
      };

      const transactionError = new Error('Transaction failed');
      mockCreate.mockRejectedValue(transactionError);

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow('Transaction failed');
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
