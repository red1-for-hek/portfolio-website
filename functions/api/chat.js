// Cloudflare Pages Function — same behaviour as the Vercel function in /api/chat.js.
// Served at /api/chat when the site is deployed on Cloudflare Pages.
// Set GROQ_API_KEY in the Pages project: Settings -> Variables and Secrets.

const MODEL = 'openai/gpt-oss-20b'; // keep in sync with /api/chat.js

const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });

export async function onRequest({ request, env }) {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
    }

    let body = {};
    try {
        body = (await request.json()) || {};
    } catch {
        body = {};
    }

    const { messages } = body;
    const apiKey = env.GROQ_API_KEY;

    if (!apiKey) {
        return json({ error: 'Server configuration error: Missing API Key' }, 500);
    }
    if (!Array.isArray(messages) || messages.length === 0) {
        return json({ error: 'Messages must be a non-empty array' }, 400);
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Groq API Error:', data);
            return json({ error: data?.error?.message || 'Failed to fetch from Groq' }, response.status);
        }

        return json(data);
    } catch (error) {
        console.error('Groq API Error:', error);
        return json({ error: 'Internal Server Error', details: error.message }, 500);
    }
}
