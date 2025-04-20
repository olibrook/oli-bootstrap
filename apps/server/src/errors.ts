import { TRPCError } from '@trpc/server';

export const badRequest = (message: object) => new TRPCError({ code: 'BAD_REQUEST', message: JSON.stringify(message) });

export const unauthorized = () => new TRPCError({ code: 'UNAUTHORIZED' });

export const notFound = () => new TRPCError({ code: 'NOT_FOUND' });

export const forbidden = () => new TRPCError({ code: 'FORBIDDEN' });
