import { getRedisClient } from '../config/redis.js'

const PDF_CACHE_PREFIX = 'pdf:'
const PDF_TTL = 1800

export const cachePdfBuffer = async (hash, buffer) => {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Le buffer passé à cachePdfBuffer n\'est pas un Buffer valide')
    }

    // Vérifier le header PDF avant conversion
    if (buffer.length > 4) {
        const isValidPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
        if (!isValidPdf) {
            throw new Error('Le buffer PDF est corrompu avant la mise en cache')
        }
    }

    const client = await getRedisClient()

    if (!client.isOpen) {
        throw new Error('Redis client not connected')
    }

    const key = `${PDF_CACHE_PREFIX}${hash}`
    const base64 = buffer.toString('base64')

    await client.set(key, base64, {
        EX: PDF_TTL
    })

    // Vérification de l'intégrité
    let verify = await client.get(key)
    if (Buffer.isBuffer(verify)) {
        verify = verify.toString('utf8')
    } else if (typeof verify !== 'string') {
        verify = String(verify)
    }

    if (base64 !== verify) {
        throw new Error('Redis corrompt les données!')
    }

    const verifyBuffer = Buffer.from(verify, 'base64')
    if (verifyBuffer.length !== buffer.length) {
        throw new Error(`Corruption: ${buffer.length} → ${verifyBuffer.length}`)
    }

    console.log('[PDF] ✓ PDF mis en cache Redis')
}

export const getCachedPdfBuffer = async (hash) => {
    const client = await getRedisClient()
    const key = `${PDF_CACHE_PREFIX}${hash}`

    const exists = await client.exists(key)
    if (exists !== 1) {
        return null
    }

    let cached = await client.get(key)
    if (!cached) {
        return null
    }

    // Redis v5 peut retourner un Buffer au lieu d'une chaîne
    if (Buffer.isBuffer(cached)) {
        cached = cached.toString('utf8')
    } else if (typeof cached !== 'string') {
        cached = String(cached)
    }

    const buffer = Buffer.from(cached, 'base64')

    // Vérifier que le buffer récupéré est un PDF valide
    if (buffer.length > 4) {
        const isValidPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
        if (!isValidPdf) {
            // Cache corrompu, supprimer et forcer une nouvelle génération
            await client.del(key)
            return null
        }
    }

    return buffer
}

export const invalidatePdfCache = async (hash) => {
    const client = await getRedisClient()
    const key = `${PDF_CACHE_PREFIX}${hash}`
    await client.del(key)
}

export const pdfExistsInCache = async (hash) => {
    const client = await getRedisClient()
    const key = `${PDF_CACHE_PREFIX}${hash}`
    const exists = await client.exists(key)
    return exists === 1
}