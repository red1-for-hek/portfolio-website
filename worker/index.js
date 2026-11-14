// Cloudflare Workers entry (used by `npx wrangler deploy`, see wrangler.jsonc).
// Static files in ./dist are served by Cloudflare directly; only /api/* reaches this script.
import { onRequest as chat } from '../functions/api/chat.js';

export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);

        if (pathname === '/api/chat') {
            return chat({ request, env });
        }
        if (pathname.startsWith('/api/')) {
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return env.ASSETS.fetch(request);
    }
};
