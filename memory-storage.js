import { Storage } from './storage.js';

export class MemoryStorage extends Storage {
    constructor({
        ttlSeconds = 60,
        cleanupIntervalMinutes = 0
    } = {}) {
        super();
        this.data = new Map();
        this.ttlSeconds = ttlSeconds;

        if (cleanupIntervalMinutes > 0) {
            this.cleanupInterval = this._startCleanup(cleanupIntervalMinutes);
        }
    }

    async get(hash) {
        const entry = this.data.get(hash);
        if (!entry) return null;

        const { value, expiresAt } = entry;
        if (Date.now() >= expiresAt) {
            this.data.delete(hash);
            return null;
        }
        return value;
    }

    async set(hash, value) {
        const expiresAt = Date.now() + this.ttlSeconds * 1000;
        this.data.set(hash, { value, expiresAt });
    }

    async delete(hash) {
        this.data.delete(hash);
    }

    async _cleanup() {
        const now = Date.now();
        for (const [hash, { expiresAt }] of this.data.entries()) {
            if (now >= expiresAt) {
                this.data.delete(hash);
            }
        }
    }

    _startCleanup(cleanupIntervalMinutes) {
        // Run cleanup at specified interval
        return setInterval(async () => {
            await this.storage._cleanup();
        }, cleanupIntervalMinutes * 60 * 1000); // Convert minutes to milliseconds
    }

    async close() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
} 