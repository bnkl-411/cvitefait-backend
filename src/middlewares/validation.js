export const validateEnhanceText = (req, res, next) => {
    const { text, context, targetRole, tone } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
        return res.status(400).json({
            error: 'Le texte doit contenir au moins 5 caractères'
        });
    }

    if (text.length > 5000) {
        return res.status(400).json({
            error: 'Le texte ne doit pas dépasser 5000 caractères'
        });
    }

    if (!context || typeof context !== 'string') {
        return res.status(400).json({
            error: 'Le contexte est requis'
        });
    }

    if (!targetRole || typeof targetRole !== 'string') {
        return res.status(400).json({
            error: 'Le rôle cible est requis'
        });
    }

    next();
};

export const validateStructureCV = (req, res, next) => {
    const { rawText } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
        return res.status(400).json({
            error: 'Le texte du CV doit contenir au moins 10 caractères'
        });
    }

    next();
};

export const validateATSAnalysis = (req, res, next) => {
    const { cvData, jobDescription } = req.body;

    if (!cvData || typeof cvData !== 'object') {
        return res.status(400).json({
            error: 'cvData est requis et doit être un objet'
        });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
        return res.status(400).json({
            error: 'La description du poste est requise (min 10 caractères)'
        });
    }

    next();
};