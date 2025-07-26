const Subscriber = require('./Subscriber');

async function createRepository() {
    const {Redis} = await import('@upstash/redis');

    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    return new SubscriberRepository(redis);
}

class SubscriberRepository {
    constructor(redis) {
        this.redis = redis;
        this.key = process.env.REDIS_SUBSCRIBER_KEY || 'subscribers';
    }

    async getAll() {
        // hgetall возвращает объект { id1: 'true', id2: 'false' }
        const raw = await this.redis.hgetall(this.key);
        return Object.entries(raw).map(([id, value]) => Subscriber.fromRedis(id, value));
    }

    async get(id) {
        const value = await this.redis.hget(this.key, id);
        if (value === null) {
            return null;
        }

        return Subscriber.fromRedis(id, value);
    }

    async add(subscriber) {
        const exists = await this.get(subscriber.id);
        if (exists) return false;

        await this.redis.hset(this.key, {[subscriber.id]: JSON.stringify(subscriber.expectResponse)});
        return true;
    }

    async update(subscriber) {
        await this.redis.hset(this.key, {[subscriber.id]: JSON.stringify(subscriber.expectResponse)});
    }

    async remove(id) {
        const result = await this.redis.hdel(this.key, id);
        return result > 0;
    }
}

module.exports = createRepository;
