import pool from '../db/database.js'

export const withTransaction = async (callback) => {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        const result = await callback(client)
        await client.query('COMMIT')
        return result
    } catch (err) {
        if (err.code === '23505') {
            err.status = 400
            err.message = 'Un CV existe déjà'
        }
        throw err
    } finally {
        client.release()
    }
}