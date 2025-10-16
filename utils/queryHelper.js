// 공통 쿼리 빌더 유틸리티
const buildSortOptions = (sortBy = 'date', sortOrder = 'desc') => {
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  return sortOptions;
};

const buildPaginationOptions = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum,
    page: pageNum
  };
};

const buildPaginationResponse = (data, total, paginationOptions) => {
  return {
    count: data.length,
    total,
    page: paginationOptions.page,
    pages: Math.ceil(total / paginationOptions.limit),
    data
  };
};

module.exports = {
  buildSortOptions,
  buildPaginationOptions,
  buildPaginationResponse
};



