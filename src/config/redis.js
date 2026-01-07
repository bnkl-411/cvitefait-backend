import { createClient } from 'redis'

let redisClient

export const getRedisClient = async () => {
    if (!redisClient) {
        redisClient = createClient({
            username: 'default',
            password: process.env.REDIS_PWD,
            socket: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
            },
        })

        redisClient.on('error', err => {
            console.error('Redis error:', err)
        })

        await redisClient.connect()
        console.log('Redis connected')
    }

    return redisClient
}

export const connectRedis = async () => {
    return await getRedisClient()
}