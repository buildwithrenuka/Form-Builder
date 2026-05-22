import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../api/src/index';
import { getToken } from './auth';

export const trpc = createTRPCReact<AppRouter>();

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function makeTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${API_BASE}/trpc`,
        headers() {
          const token = getToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
