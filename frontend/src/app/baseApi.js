import { createApi } from '@reduxjs/toolkit/query/react';
import api from './axios';

/**
 * BaseQuery RTK Query basé sur notre instance Axios partagée.
 * Permet de centraliser auth, intercepteurs, base URL.
 */
const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await api({ url, method, data, params, headers });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status ?? 'FETCH_ERROR',
          data: err.response?.data || { message: err.message },
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Auth', 'Account', 'Transaction', 'AdminUser', 'AdminAccount', 'Stats', 'AuditLog'],
  endpoints: () => ({}),
});
