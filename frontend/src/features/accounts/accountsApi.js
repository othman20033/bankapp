import { baseApi } from '@/app/baseApi';

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: () => ({ url: '/accounts' }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Account', id })), { type: 'Account', id: 'LIST' }]
          : [{ type: 'Account', id: 'LIST' }],
    }),
    getAccount: builder.query({
      query: (id) => ({ url: `/accounts/${id}` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (_r, _e, id) => [{ type: 'Account', id }],
    }),
    getAccountBalance: builder.query({
      query: (id) => ({ url: `/accounts/${id}/balance` }),
    }),
    createAccount: builder.mutation({
      query: (body) => ({ url: '/accounts', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useGetAccountBalanceQuery,
  useCreateAccountMutation,
} = accountsApi;
