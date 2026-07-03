const { calculateRuleScore } = require('./rules');

exports.parseAIResponse = (rawContent, profile, listing) => {
  if (!rawContent || typeof rawContent !== 'string') {
    console.warn('AI response empty or invalid type, falling back to rule engine.');
    return calculateRuleScore(profile, listing);
  }

  try {
    let cleanText = rawContent.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    }

    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleanText);

    if (
      typeof parsed.score !== 'number' ||
      isNaN(parsed.score) ||
      typeof parsed.explanation !== 'string' ||
      !parsed.explanation.trim()
    ) {
      console.warn('AI JSON schema validation failed, falling back to rule engine:', parsed);
      return calculateRuleScore(profile, listing);
    }

    const score = Math.min(100, Math.max(0, Math.round(parsed.score)));
    return {
      score,
      explanation: parsed.explanation.trim(),
      generatedBy: 'AI'
    };
  } catch (error) {
    console.warn('AI JSON parsing failed, falling back to rule engine:', error.message);
    return calculateRuleScore(profile, listing);
  }
};
