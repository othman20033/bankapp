import { baseApi } from '@/app/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStatsOverview: builder.query({
      query: () => ({ url: '/admin/stats/overview' }),
      providesTags: ['Stats'],
    }),
    getAdminUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),
    getAdminAccounts: builder.query({
      query: (params) => ({ url: '/admin/accounts', params }),
      providesTags: [{ type: 'AdminAccount', id: 'LIST' }],
    }),
    blockAccount: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/accounts/${id}/block`,
        method: 'PATCH',
        data: { reason },
      }),
      invalidatesTags: [{ type: 'AdminAccount', id: 'LIST' }],
    }),
    activateAccount: builder.mutation({
      query: (id) => ({ url: `/admin/accounts/${id}/activate`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'AdminAccount', id: 'LIST' }],
    }),
    getAuditLogs: builder.query({
      query: (params) => ({ url: '/admin/audit-logs', params }),
      providesTags: ['AuditLog'],
    }),
  }),
});

export const {
  useGetStatsOverviewQuery,
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useGetAdminAccountsQuery,
  useBlockAccountMutation,
  useActivateAccountMutation,
  useGetAuditLogsQuery,
} = adminApi;
