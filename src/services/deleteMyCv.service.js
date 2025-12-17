import { withTransaction } from '../utils/withTransaction.js'
import { deleteCvByUserId } from '../repositories/cv.repository.js'

export const deleteMyCvService = async (userId) => {
    return withTransaction(async (client) => {
        const result = await deleteCvByUserId(client, userId)

        if (result.rowCount === 0) {
            throw Object.assign(
                new Error('Aucun CV à supprimer'),
                { status: 404 }
            )
        }

        return { success: true }
    })
}
