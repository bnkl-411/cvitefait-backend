import { withTransaction } from '../utils/withTransaction.js'
import { updateCvData } from '../repositories/cv.repository.js'

export const saveCvService = async (userId, data) => {
    return withTransaction(async (client) => {
        const result = await updateCvData(client, userId, data)

        if (result.rows.length === 0) {
            throw Object.assign(
                new Error('CV non trouvé'),
                { status: 404 }
            )
        }

        return {
            updatedAt: new Date(result.rows[0].updated_at).getTime()
        }
    })
}
