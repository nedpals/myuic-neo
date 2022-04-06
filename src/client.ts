import { newClient } from '@myuic-api/client';
export { eventbus } from '@myuic-api/client/lib/event';

export const backendUrl = import.meta.env.VITE_API_URL || 'http://api.my.uic.edu.ph'; // latter is a dummy URL
export const client = newClient({ baseUrl: backendUrl });