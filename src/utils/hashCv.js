import crypto from 'crypto'


export function hashCv({ localStorage, url }) {
    return crypto
        .createHash('sha256')
        .update(localStorage)
        .update(url)
        .digest('hex')
        .slice(0, 8)
}
