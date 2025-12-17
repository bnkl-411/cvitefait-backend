import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/database.js'
import { JWT_CONFIG } from '../config/jwt.js'

export const signup = async (req, res, next) => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' })
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const client = await pool.connect()
        try {
            // await client.query('BEGIN')

            const userInsert = await client.query({
                name: 'insert-user',
                text: 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
                values: [email, hashedPassword]
            })
            const userId = userInsert.rows[0].id

            const token = jwt.sign(
                { userId },
                JWT_CONFIG.secret,
                { expiresIn: JWT_CONFIG.expiresIn }
            )

            res.cookie(JWT_CONFIG.cookie.name, token, JWT_CONFIG.cookie.options)

            res.status(201).json({
                user: {
                    id: userId,
                    email
                }
            })
        } catch (err) {
            if (err.code === '23505') {
                return res.status(400).json({ error: 'Email déjà utilisé' })
            }
            throw err
        } finally {
            client.release()
        }
    } catch (error) {
        next(error)
    }
}

export const login = async (req, res, next) => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' })
        }

        // ✅ Récupérer user + cv en même temps
        const userQuery = await pool.query({
            name: 'fetch-user-cv-by-email',
            text: `SELECT u.id, u.email, u.password_hash, c.slug, c.data, c.updated_at 
                   FROM users u
                   LEFT JOIN cvs c ON c.user_id = u.id
                   WHERE u.email = $1`,
            values: [email]
        })

        const user = userQuery.rows[0]

        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' })
        }

        const validPassword = await bcrypt.compare(password, user.password_hash)
        if (!validPassword) {
            return res.status(401).json({ error: 'Identifiants invalides' })
        }

        const token = jwt.sign(
            { userId: user.id, slug: user.slug },
            JWT_CONFIG.secret,
            { expiresIn: JWT_CONFIG.expiresIn }
        )

        res.cookie(JWT_CONFIG.cookie.name, token, JWT_CONFIG.cookie.options)

        // ✅ Retourner les données pour le frontend
        res.json({
            user: {
                id: user.id,
                email: user.email,
                cvSlug: user.slug,
                cvData: user.data,
                updatedAt: new Date(user.updated_at).getTime()
            }
        })
    } catch (error) {
        next(error)
    }
}

export const logout = async (req, res) => {
    res.clearCookie(JWT_CONFIG.cookie.name)
    res.json({ message: 'Déconnexion réussie' })
}

export const getMe = async (req, res, next) => {
    try {
        // ✅ Récupérer user + cv complet
        const userQuery = await pool.query({
            name: 'fetch-user-cv-by-id',
            text: `SELECT u.id, u.email, u.created_at, c.slug, c.data, c.updated_at 
                   FROM users u
                   LEFT JOIN cvs c ON c.user_id = u.id
                   WHERE u.id = $1`,
            values: [req.userId]
        })

        const user = userQuery.rows[0]

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' })
        }

        // ✅ Retourner dans le format attendu par le frontend
        res.json({
            id: user.id,
            email: user.email,
            cvSlug: user.slug,
            cvData: user.data,
            updatedAt: new Date(user.updated_at).getTime()
        })
    } catch (error) {
        next(error)
    }
}