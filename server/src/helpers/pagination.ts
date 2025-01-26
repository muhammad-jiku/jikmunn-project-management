interface IOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface IOptionsResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}

const calculatePagination = (options: IOptions): IOptionsResult => {
  const page = Math.max(Number(options.page || 1), 1); // Ensure page is at least 1
  const limit = Number(options.limit || 10);

  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const paginationHelpers = {
  calculatePagination,
};
