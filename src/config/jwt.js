export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
    cookie: {
        name: 'jwt_token',
        options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    }
}