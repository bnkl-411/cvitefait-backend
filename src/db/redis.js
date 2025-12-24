import { createClient } from 'redis'

let redisClient

export const getRedisClient = () => {
    if (!redisClient) {
        redisClient = createClient({
            username: 'default',
            password: process.env.REDIS_PWD,
            socket: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
            },
        })
        console.log('Redis connected')

        redisClient.on('error', err => {
            console.error('Redis error:', err)
        })
    }

    return redisClient
}

export const connectRedis = async () => {
    const client = getRedisClient()
    if (!client.isOpen) {
        await client.connect()
    }
}