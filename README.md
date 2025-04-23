# Stpd Cache

A simple yet powerful caching module. The name Stpd (stupid) doesn't reflect its simplicity, but rather the irony that a seemingly simple concept like caching, when properly implemented, can be a game-changer for massive projects.

## Features

- **Multiple Storage Backends**: Memory and Redis support
- **Configurable Rules**: Define when to cache or clear items
- **Statistics Tracking**: Monitor cache hits and misses
- **Automatic Cleanup**: Configurable TTL and cleanup intervals
- **Async Support**: Full Promise-based API

## Installation

```bash
npm install stpd
```

## Basic Usage

```javascript
import Stpd from 'stpd';

// Create a new cache instance with default memory storage
const stpd = new Stpd({
    ttlSeconds: 60, // Time to live in seconds
    cleanupIntervalMinutes: 5, // How often to clean expired items
    enableStats: true // Enable hit/miss statistics
});

// Cache a value with automatic generation / key = ['user','123']
const result = await stpd.cache(['user','123'], async () => {
    // This function only runs if the value isn't in cache
    return await fetchUserFromDatabase('123');
});

// Clear a specific item from cache
await cache.clear('user:123');

// Get cache statistics
const stats = stpd.getStats();
// stats = { hits: 0, misses: 1 }
```

## Advanced Usage

### Custom Caching Rules

```javascript
cache.setRuleCache((id) => {
    return id[0] === 'user';
});
```

### Redis Storage

```javascript
import { RedisStorage, Stpd } from 'stpd';
import { createClient } from 'redis';

const client = createClient();
await client.connect();

const storage = new RedisStorage({ client });
const stpd = new Stpd({ ttlSeconds: 5, storage }); // 5 second TTL

async function getOne() {
    return stpd.cache({ n: 1 }, async () => {
        console.log('Generating 1');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return '{ n: 1 }';
    });
}

console.log('First call (should generate):', await getOne());
console.log('Second call (should use cache):', await getOne());
console.log('Waiting 6 seconds...');
await new Promise(resolve => setTimeout(resolve, 6000));
console.log('Third call (should generate again):', await getOne());

stpd.close();
```
#### Output
```bash
First call (should generate): { n: 1 }
Second call (should use cache): { n: 1 }
Waiting 6 seconds...
Generating 1
Third call (should generate again): { n: 1 }
```

### Memory Storage with Custom Settings

```javascript
import { MemoryStorage } from 'stpd';

const cache = new Stpd({
    storage: new MemoryStorage({
        ttlSeconds: 300, // 5 minutes
        cleanupIntervalMinutes: 5 // Clean every minute
    })
});
```

## API Reference

### Stpd Constructor Options

- `ttlSeconds` (number): Default time to live in seconds (default: 60)
- `cleanupIntervalMinutes` (number): How often to clean expired items (default: 5)
- `enableStats` (boolean): Enable hit/miss statistics (default: true)
- `storage` (Storage): Custom storage implementation (default: MemoryStorage)

### Methods

- `cache(id, generator)`: Get or compute value if not in cache
- `clear(id)`: Remove item from cache
- `getStats()`: Get cache statistics
- `setRuleCache(rule)`: Set rule for when to cache items
- `setRuleClear(rule)`: Set rule for when to clear items
- `close()`: Clean up resources

### Storage Implementations

#### MemoryStorage
- In-memory storage with automatic cleanup
- Perfect for single-process applications

#### RedisStorage
- Distributed cache using Redis
- Ideal for multi-process or distributed applications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
