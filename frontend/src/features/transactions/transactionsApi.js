import { baseApi } from '@/app/baseApi';

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: (params) => ({ url: '/transactions', params }),
      // Conserve la pagination Laravel (data, meta, links)
      providesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
    getTransaction: builder.query({
      query: (id) => ({ url: `/transactions/${id}` }),
      transformResponse: (res) => res.data ?? res,
    }),
    deposit: builder.mutation({
      query: (body) => ({ url: '/transactions/deposit', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Account', id: 'LIST' },
      ],
    }),
    withdraw: builder.mutation({
      query: (body) => ({ url: '/transactions/withdraw', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Account', id: 'LIST' },
      ],
    }),
    initiateTransfer: builder.mutation({
      query: (body) => ({ url: '/transactions/transfer/initiate', method: 'POST', data: body }),
    }),
    confirmTransfer: builder.mutation({
      query: (body) => ({ url: '/transactions/transfer/confirm', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Account', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useDepositMutation,
  useWithdrawMutation,
  useInitiateTransferMutation,
  useConfirmTransferMutation,
} = transactionsApi;
