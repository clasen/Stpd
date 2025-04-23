export class Storage {
    async get(hash) {
        throw new Error('Method not implemented');
    }

    async set(hash, value, ttlMs) {
        throw new Error('Method not implemented');
    }

    async delete(hash) {
        throw new Error('Method not implemented');
    }

    async close() {
        throw new Error('Method not implemented');
    }
}