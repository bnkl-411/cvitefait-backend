// Cache en mémoire avec nettoyage automatique et limite de taille
class MemoryCache {
    constructor(maxSize = 1000, cleanupInterval = 3600000) { // 1h cleanup
        this.cache = new Map();
        this.maxSize = maxSize;

        // Nettoyage automatique des entrées expirées
        setInterval(() => this.cleanup(), cleanupInterval);
    }

    get(key) {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Vérifier expiration
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        // Mettre à jour lastAccess pour LRU
        entry.lastAccess = Date.now();
        return entry.value;
    }

    set(key, value, ttlSeconds = 604800) {
        // Si cache plein, supprimer les plus anciennes entrées (LRU)
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        this.cache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000),
            lastAccess: Date.now()
        });
    }

    evictOldest() {
        // Supprimer 10% des entrées les moins récemment utilisées
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

        const toRemove = Math.ceil(this.maxSize * 0.1);
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(entries[i][0]);
        }
    }

    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
    }

    clear() {
        this.cache.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }
}

const cache = new MemoryCache(1000); // Max 1000 entrées

export class CacheService {
    static get(key) {
        return cache.get(key);
    }

    static set(key, value, ttlSeconds = 604800) {
        cache.set(key, value, ttlSeconds);
    }

    static generateKey(...parts) {
        // Hacher pour réduire la taille des clés
        return parts.filter(Boolean).join(':').substring(0, 200);
    }

    static clear() {
        cache.clear();
    }

    static getStats() {
        return cache.getStats();
    }
}