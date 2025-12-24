export const findUserCv = (client, userId) => {
    return client.query({
        name: 'get-user-cv',
        text: 'SELECT slug FROM cvs WHERE user_id = $1',
        values: [userId]
    })
}

export const insertCv = (client, params) => {
    const { userId, slug, data } = params

    return client.query({
        name: 'insert-cv',
        text: `
      INSERT INTO cvs (user_id, slug, data, updated_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING updated_at
    `,
        values: [userId, slug, JSON.stringify(data)]
    })
}

// TODO  : chercher dans pdf_exports et return le fichier
export const findCvBySlug = (client, slug) => {

    return client.query({
        name: 'get-cv-by-slug',
        text:
            `SELECT cvs.data, cvs.updated_at
            FROM cvs 
            WHERE cvs.slug = $1
        `,
        values: [slug]
    })
}

export const findCvByUserId = (client, userId) => {
    return client.query({
        name: 'get-cv-by-user-id',
        text: `
            SELECT data, updated_at, slug
            FROM cvs
            WHERE user_id = $1
        `,
        values: [userId]
    })
}

export const updateCvData = (client, userId, data) => {
    return client.query({
        name: 'update-cv-data',
        text: `
            UPDATE cvs
            SET data = $1,
                updated_at = NOW()
            WHERE user_id = $2
            RETURNING updated_at
        `,
        values: [data, userId]
    })
}

export const deleteCvByUserId = (client, userId) => {
    return client.query({
        name: 'delete-cv-by-user-id',
        text: `
            DELETE FROM cvs
            WHERE user_id = $1
        `,
        values: [userId]
    })
}