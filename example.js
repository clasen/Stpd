import { RedisStorage, Stpd } from './index.js';
import { createClient } from 'redis';

const client = createClient();
await client.connect();

const storage = new RedisStorage({ client });
const stpd = new Stpd({ ttlSeconds: 5, storage }); // 5 second TTL

async function getOne() {
    return stpd.cache(['n', 1], async () => {
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