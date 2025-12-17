// utils/prompts.js
export const CV_PARSE_PROMPT = `
Analyse ce CV et extrait les informations dans un JSON structuré.

CV :
{RAW_TEXT}

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de texte avant/après) :
{
  "contact": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "",
  "experiences": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM ou present",
      "description": "",
      "achievements": []
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "year": "",
      "description": ""
    }
  ],
  "skills": {
    "technical": [],
    "languages": [],
    "soft": []
  },
  "projects": []
}

Règles strictes :
- Dates au format YYYY-MM
- Si info manquante, laisser string vide ""
- Achievements = liste bullets points
- Pas de commentaires dans le JSON
`;