import crypto from 'crypto'

/**
 * Génère un hash court (8 caractères) pour le contenu du CV
 * @param {string} localStorageData - les données du CV
 * @param {string} url - URL du CV (pour inclure le contexte)
 * @returns {string} hash court
 */
export const generateHash = (localStorageData, url) => {
    const hash = crypto
        .createHash('sha256')
        .update(localStorageData)
        .update(url)
        .digest('hex')
    return hash.slice(0, 8)
}
