import { OrderedMap, OrderedSet } from 'js-sdsl'

export type SDRServer = {
    name: string;
    hardware: string;
    antenna: string;
    bandwidth: number;
    users: number;
    base_frequency: number;
    url: string;
    remarks: string;
    description: string;
    last_update: EpochTimeStamp;
}

type SDRServerInternal = SDRServer & {
    id: string;
}

type SDRLastUpdate = {
    server_id: string;
    timestamp: EpochTimeStamp;
}

function lastUpdateCmp(a: SDRLastUpdate, b: SDRLastUpdate) {
    if (a.timestamp === b.timestamp) {
        return a.server_id.localeCompare(b.server_id)
    }
    return a.timestamp - b.timestamp
}


let servers = new OrderedMap<string, SDRServerInternal>()
let last_updated = new OrderedSet<SDRLastUpdate>([], lastUpdateCmp)

function cleanStaleServers() {
    let now = Date.now()
    let stale = now - 5 * 60 * 1000

    while (last_updated.size() > 0 && last_updated.begin().pointer.timestamp < stale) {
        last_updated.eraseElementByIterator(last_updated.begin())
    }
}

setInterval(cleanStaleServers, 60 * 1000)

export function addServer(server: SDRServerInternal) {
    let original = servers.getElementByKey(server.id)
    if (original) {
        let previousUpdate = {
            server_id: original.id,
            timestamp: original.last_update
        }
        last_updated.eraseElementByKey(previousUpdate)
    }
    servers.setElement(server.id, server)
    last_updated.insert({
        server_id: server.id,
        timestamp: server.last_update
    })
}

export function getAllServers() {
    // Return servers as an array, delete the id field
    let all_servers: SDRServer[] = []
    servers.forEach((server) => {
        let copy = { ...server[1] } as SDRServer
        delete copy.id
        all_servers.push(copy)
    })
    return all_servers
}