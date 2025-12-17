import { enhanceText, structureCV, analyzeATS } from '../services/api/gemini.service.js';
import { CacheService } from '../services/cache.service.js';

export const enhanced = async (req, res, next) => {
  try {
    const { text, context, targetRole, tone } = req.body;

    // // Normaliser pour augmenter taux de cache hit
    // const normalizedText = text.trim().toLowerCase();
    // const normalizedContext = context?.trim() || 'general';

    // const cacheKey = CacheService.generateKey(
    //   'enhance',
    //   normalizedText,
    //   normalizedContext,
    //   targetRole,
    //   tone
    // );

    // const cached = CacheService.get(cacheKey);

    // if (cached) {
    //   console.log(`✅ Cache HIT @ ${new Date().toISOString()}: ${cached}`);
    //   // CORRECTION A APPORTER SI CACHE ACTIF:
    //   // return res.json({ enhanced: JSON.parse(cached), fromCache: true }); 
    // }

    // console.log(`❌ Cache MISS @ ${new Date().toISOString()}: ${cacheKey}`);

    const enhancedJsonString = await enhanceText(text, context, targetRole, tone);

    let enhancedObject;
    try {
      enhancedObject = JSON.parse(enhancedJsonString);
    } catch (e) {
      console.error("Erreur de parsing JSON de l'IA:", e);
      return res.status(500).json({ error: "Réponse du modèle malformée." });
    }

    // Cache 30 jours
    // CacheService.set(cacheKey, enhancedJsonString, 2592000);

    res.json({ enhanced: enhancedObject, fromCache: false });

  } catch (error) {
    next(error);
  }
};

export const structuredCvData = async (req, res, next) => {
  try {
    const { rawText } = req.body;

    const cacheKey = CacheService.generateKey('structure', rawText.trim().substring(0, 100));
    const cached = CacheService.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.json({ data: cached, fromCache: true });
    }

    console.log(`❌ Cache MISS: ${cacheKey}`);

    const structured = await structureCV(rawText);

    CacheService.set(cacheKey, structured, 2592000);

    res.json({ data: structured, fromCache: false });

  } catch (error) {
    next(error);
  }
};

export const atsScore = async (req, res, next) => {
  try {
    const { cvData, jobDescription } = req.body;

    const cacheKey = CacheService.generateKey(
      'ats',
      JSON.stringify(cvData).substring(0, 100),
      jobDescription.substring(0, 100)
    );

    const cached = CacheService.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.json({ ...cached, fromCache: true });
    }

    console.log(`❌ Cache MISS: ${cacheKey}`);

    const analysis = await analyzeATS(cvData, jobDescription);

    CacheService.set(cacheKey, analysis, 2592000);

    res.json({ ...analysis, fromCache: false });

  } catch (error) {
    next(error);
  }
};