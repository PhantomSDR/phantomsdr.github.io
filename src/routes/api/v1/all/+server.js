
import { getAllServers } from '$lib/servers';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return json(getAllServers())
}
