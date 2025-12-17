// middlewares/rateLimit.js
const requestCounts = new Map();

export const rateLimitByIP = (maxRequests = 10, windowMs = 60000) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const userData = requestCounts.get(ip);

        if (now > userData.resetTime) {
            userData.count = 1;
            userData.resetTime = now + windowMs;
            return next();
        }

        if (userData.count >= maxRequests) {
            return res.status(429).json({
                error: 'Trop de requêtes. Réessayez dans quelques instants.'
            });
        }

        userData.count++;
        next();
    };
};