import { nanoid } from 'nanoid'
import { withTransaction } from '../utils/withTransaction.js'
import { findUserCv, insertCv } from '../repositories/cv.repository.js'
import { cvTypeDefault } from '../config/cvTypeDefault.js'

export const createCvService = async ({
    userId,
    firstName,
    lastName,
    email
}) => {
    return withTransaction(async (client) => {
        const existingCv = await findUserCv(client, userId)

        if (existingCv.rows.length > 0) {
            await client.query('ROLLBACK')
            throw Object.assign(
                new Error('Un CV existe déjà pour cet utilisateur'),
                { status: 400 }
            )
        }

        const slug = nanoid(10)
        const userCvData = structuredClone(cvTypeDefault)

        const userEmail = userCvData.cv.contact.find(item => item.key === 'email')
        if (userEmail) userEmail.value = email

        const firstNameExists = userCvData.cv.personal.find(item => item.key === 'firstName')
        if (firstNameExists) firstNameExists.value = firstName

        const lastNameExists = userCvData.cv.personal.find(item => item.key === 'lastName')
        if (lastNameExists) lastNameExists.value = lastName

        const fullName = userCvData.cv.personal.find(item => item.key === 'fullName')
        if (fullName) fullName.value = firstName + ' ' + lastName

        const cvInsert = await insertCv(client, {
            userId,
            slug,
            data: userCvData
        })

        return {
            slug,
            cvData: userCvData,
            updatedAt: new Date(cvInsert.rows[0].updated_at).getTime()
        }
    })
}
