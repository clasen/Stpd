import { Storage } from './storage.js';
import { createClient } from 'redis';

export class RedisStorage extends Storage {
    constructor({ client,
        prefix = 'st:',
        ttlSeconds = 60
    } = {}) {
        super();

        if (!client) {
            this.client = createClient();
            this.client.connect();
        } else {
            this.client = client;
        }

        this.client.on('error', err => console.error('Redis Client Error', err));
        this.prefix = prefix;
        this.ttlSeconds = ttlSeconds;
    }

    close() {
        this.client.quit();
    }

    async get(hash) {
        const data = await this.client.get(this.prefix + hash);
        if (!data) return null;
        return JSON.parse(data);
    }

    async set(hash, value) {
        const data = JSON.stringify(value);
        await this.client.set(this.prefix + hash, data, { EX: this.ttlSeconds });
    }

    async delete(hash) {
        await this.client.del(this.prefix + hash);
    }

    async close() {
        return this.client.quit();
    }
} 