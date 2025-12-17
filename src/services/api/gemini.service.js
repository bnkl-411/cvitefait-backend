import { ai, MODEL } from '../../config/gemini.js';
import { CV_PARSE_PROMPT } from '../../utils/prompts.js';

/**
 * Fonction améliorée pour réécrire une phrase de CV en utilisant l'API Gemini.
 * Le Rôle Ciblé et le Contexte sont maintenant optionnels.
 * @param {string} text Le texte original à améliorer.
 * @param {string | null} [context=null] Le contexte de l'expérience (ex: "Projet de refonte du site e-commerce").
 * @param {string | null} [targetRole=null] Le rôle visé pour le CV (ex: "Développeur Full-Stack Senior").
 * @param {string} [tone="professionnel"] Le ton souhaité (ex: "professionnel", "dynamique", "synthétique").
 * @param {string[]} [actionVerbs=[]] Liste des verbes d'action obligatoires (ex: ["optimiser", "diriger"]).
 * @param {string[]} [keywords=[]] Liste des mots-clés obligatoires à inclure (ex: ["React", "Agile"]).
 * @returns {Promise<string>} Une chaîne JSON contenant les deux versions réécrites.
 */
export async function enhanceText(text, context = null, targetRole = null, tone = "professionnel", actionVerbs = [], keywords = []) {
  const constraints = [
    targetRole ? `Rôle ciblé: ${targetRole}` : null,
    context ? `Contexte: ${context}` : null,
    `Ton: ${tone}`,
    actionVerbs.length > 0 ? `Verbes d'action obligatoires: ${actionVerbs.join(', ')}` : null,
    keywords.length > 0 ? `Mots-clés obligatoires à inclure: ${keywords.join(', ')}` : null,
  ].filter(c => c !== null);

  // ID de Variation unique pour forcer la non-répétition des tokens d'entrée
  const uniqueID = Math.random().toString(36).substring(2, 8);

  const promptText = `
Améliore ce texte pour un CV. (ID de Variation: ${uniqueID})

Instructions de ciblage:
${constraints.join('\n\t')}

Texte original à améliorer (FOCUS PRINCIPAL): ${text}
`;

  const contents = [{
    role: "user",
    parts: [{ text: promptText }]
  }];

  const systemPrompt = `
Votre seule et unique tâche est de réécrire et d'améliorer le texte fourni.
Votre réponse doit être exclusivement au format JSON.
Le texte réécrit doit être :
1. Plus explicite, mieux formulé, et orienté résultats.
2. Adopter un ton professionnel, mais non pompeux.
3. Inclure 2-3 compétences clés pour le rôle ciblé (si fourni).
4. Se terminer par l'objectif atteint ou la valeur ajoutée de l'action.
5. Utiliser les verbes et mots-clés requis.
6. Respecter une longueur de 60 à 70 mots maximum.
7. IMPÉRATIF : La formulation doit être lexicalement distincte de toute version générée précédemment, même si le texte d'entrée est jugé optimal.
8. Proposer une seule version dans la propriété 'resume'.
`;

  const config = {
    thinkingConfig: {
      thinkingBudget: 0
    },
    temperature: 0.3,
    responseMimeType: "application/json",
    systemInstruction: systemPrompt,
    responseSchema: {
      type: "OBJECT",
      properties: {
        resume: {
          type: "STRING",
          description: "La version unique, améliorée, et non répétitive du texte original."
        }
      },
      required: ["resume"]
    }
  };


  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: contents,
      config: config,
    });

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      const content = candidate.content;

      if (content && content.parts && content.parts.length > 0) {
        return content.parts[0].text;
      } else {
        const reason = candidate.finishReason?.name || 'Inconnu';
        console.error(`Génération échouée. Raison : ${reason}. Le contenu était vide.`);
        return JSON.stringify({
          error: "Erreur de génération : le contenu est vide.",
          reason: reason
        });
      }
    }

    return JSON.stringify({
      error: "Aucun candidat de réponse retourné."
    });

  } catch (error) {
    console.error("Erreur critique d'API:", error);

    return JSON.stringify({
      error: "Erreur critique lors de l'appel API.",
      details: error.message
    });
  }
}

export async function structureCV(rawText) {
  const prompt = CV_PARSE_PROMPT.replace('{RAW_TEXT}', rawText);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { temperature: 0.2 }
  });

  const cleaned = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function analyzeATS(cvData, jobDescription) {
  const prompt = `
Analyse ATS de ce CV par rapport à cette offre.

CV: ${JSON.stringify(cvData)}
Offre: ${jobDescription}

Retourne un JSON avec:
- score (0-100)
- issues (array)
- suggestions (array)
- missingKeywords (array)
  `;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { temperature: 0.2 }
  });

  const cleaned = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}