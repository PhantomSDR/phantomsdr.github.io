
import { addServer } from '$lib/servers';
import { error, json } from '@sveltejs/kit';
import Ajv from 'ajv';

const ajv = new Ajv()
const schema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        hardware: { type: "string" },
        antenna: { type: "string" },
        bandwidth: { type: "number" },
        users: { type: "integer" },
        remarks: { type: "string" },
        description: { type: "string" },
        center_frequency: { type: "number" },
        port: { type: "integer", minimum: 1, maximum: 65535 },
        url: { type: "string" },
    },
    required: ["id", "name", "bandwidth", "center_frequency"],
    oneOf: [
        { required: ["port"] },
        { required: ["url"] },
    ],
    additionalProperties: false
}
const validate = ajv.compile(schema)

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
    let data = await event.request.json()
    if (!validate(data)) {
        return error(400, { error: validate.errors })
    }
    data.hardware = data.hardware || ""
    data.antenna = data.antenna || ""
    data.remarks = data.remarks || ""
    data.description = data.description || ""
    data.users = data.users || 0
    if (!data.url) {
        let ip = event.getClientAddress()
        // If IP is IPv6, wrap it in square brackets
        if (ip.includes(':')) {
            ip = `[${ip}]`
        }
        data.url = `http://${ip}:${data.port}`
    }
    data.last_update = Date.now()
    addServer(data)
    return json({'success': true, 'data': data})
}