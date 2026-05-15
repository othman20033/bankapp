import { baseApi } from '@/app/baseApi';

export const otpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (body) => ({ url: '/otp/send', method: 'POST', data: body }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({ url: '/otp/verify', method: 'POST', data: body }),
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = otpApi;
