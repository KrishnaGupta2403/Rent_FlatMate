exports.forceFail = false;

exports.getApiKey = () => {
  return process.env.AI_API_KEY ||
         process.env.OPENROUTER_API_KEY ||
         process.env.OPENAI_API_KEY;
};

exports.callLLM = async (promptText) => {
  if (exports.forceFail) {
    throw new Error('Forced AI API failure for testing fallback');
  }

  const apiKey = exports.getApiKey();
  if (!apiKey || apiKey === 'invalid_key' || apiKey === 'kill_key') {
    throw new Error('Invalid or disabled AI API key');
  }

  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rentflatmate.com',
        'X-Title': 'Rent Flatmate'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: promptText }
        ],
        temperature: 0.2,
        max_tokens: 500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI API failed with status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI model');
    }

    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI API request timed out after 12 seconds');
    }
    throw error;
  }
};
