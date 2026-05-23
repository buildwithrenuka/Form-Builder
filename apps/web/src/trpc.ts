import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../api/src/index';
import { getToken } from './auth';

export const trpc = createTRPCReact<AppRouter>();

const LOCAL_API_BASE = 'http://localhost:3001';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);
const PRODUCTION_API_BASE = 'https://formverse-api.renuka-khirwadkarr.workers.dev';

function resolveApiBase() {
  const envApiBase = import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const isLocalHost = LOCAL_HOSTNAMES.has(window.location.hostname);

    if (isLocalHost) {
      return envApiBase ?? LOCAL_API_BASE;
    }

    if (envApiBase && envApiBase !== LOCAL_API_BASE) {
      return envApiBase;
    }
  }

  return envApiBase && envApiBase !== LOCAL_API_BASE ? envApiBase : PRODUCTION_API_BASE;
}

export const API_BASE = resolveApiBase();

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
