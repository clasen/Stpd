import farmhash from 'farmhash';
import { MemoryStorage } from './memory-storage.js';

export class Stpd {
    constructor({
        ttlSeconds = 60,
        cleanupIntervalMinutes = 5,
        enableStats = true,
        storage = new MemoryStorage({ ttlSeconds, cleanupIntervalMinutes })
    } = {}) {
        storage.ttlSeconds = ttlSeconds;
        this.storage = storage;
        
        this.enableStats = enableStats;
        this.rule = {
            clear: (id) => false,
            cache: (id) => true,
        }
        this.stats = {
            hits: 0,
            misses: 0
        };
    }

    setRuleClear(rule) {
        this.rule.clear = rule;
    }

    setRuleCache(rule) {
        this.rule.cache = rule;
    }

    _hash(id) {
        return farmhash.hash64(JSON.stringify(id)).toString(36);
    }

    async clear(id) {
        const hash = this._hash(id);
        await this.storage.delete(hash);
    }

    async close() {
        await this.storage.close();
    }

    getStats() {
        if (!this.enableStats) {
            return null;
        }
        return { ...this.stats };
    }

    _statsMiss() {
        if (this.enableStats) {
            this.stats.misses++;
        }
    }

    _statsHit() {
        if (this.enableStats) {
            this.stats.hits++;
        }
    }

    async cache(id, generator) {
        if (this.rule.clear(id)) {
            await this.clear(id);
            this._statsMiss();
            return await generator();
        }

        if (!this.rule.cache(id)) {
            this._statsMiss();
            return await generator();
        }

        const hash = this._hash(id);

        const value = await this.storage.get(hash);
        if (value) {
            this._statsHit();
            return value;
        }

        this._statsMiss();

        const content = await generator();
        await this.storage.set(hash, content);

        return content;
    }
}