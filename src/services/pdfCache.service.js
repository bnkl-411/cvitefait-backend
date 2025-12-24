import { getRedisClient } from '../db/redis.js'

const PDF_CACHE_PREFIX = 'pdf:'
const PDF_TTL = 1800 // 30 minutes

// Cache un PDF buffer
export const cachePdfBuffer = async (hash, buffer) => {
    try {
        const client = getRedisClient()
        const key = `${PDF_CACHE_PREFIX}${hash}`
        await client.setEx(key, PDF_TTL, buffer.toString('base64'))
        console.log(`PDF mis en cache Redis: ${hash}`)
    } catch (error) {
        console.error('Erreur cache PDF:', error)
        // Ne pas bloquer l'exécution si Redis échoue
    }
}

// Récupère un PDF depuis le cache
export const getCachedPdfBuffer = async (hash) => {
    try {
        const client = getRedisClient()
        const key = `${PDF_CACHE_PREFIX}${hash}`
        const cached = await client.get(key)

        if (cached) {
            console.log(`PDF trouvé dans Redis cache: ${hash}`)
            return Buffer.from(cached, 'base64')
        }

        return null
    } catch (error) {
        console.error('Erreur récupération cache PDF:', error)
        return null
    }
}

// Invalide le cache pour un hash
export const invalidatePdfCache = async (hash) => {
    try {
        const client = getRedisClient()
        const key = `${PDF_CACHE_PREFIX}${hash}`
        await client.del(key)
        console.log(`Cache PDF invalidé: ${hash}`)
    } catch (error) {
        console.error('Erreur invalidation cache PDF:', error)
    }
}

// Vérifie si un PDF existe en cache
export const pdfExistsInCache = async (hash) => {
    try {
        const client = getRedisClient()
        const key = `${PDF_CACHE_PREFIX}${hash}`
        const exists = await client.exists(key)
        return exists === 1
    } catch (error) {
        console.error('Erreur vérification cache PDF:', error)
        return false
    }
}