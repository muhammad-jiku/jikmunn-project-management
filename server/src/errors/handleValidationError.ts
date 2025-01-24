import { Prisma } from '@prisma/client';
import { IGenericErrorResponse } from '../interfaces/error';

const handleValidationError = (
  err: Prisma.PrismaClientValidationError
): IGenericErrorResponse => {
  const errors = [
    {
      path: '',
      message: err.message,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation error!',
    errorMessages: errors,
  };
};

export default handleValidationError;
