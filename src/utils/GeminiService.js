// === CONFIGURATION ===
// WARNING: Exposing API keys in frontend code is unsafe for production.
// This is done here strictly for a designated prototype environment.
const GEMINI_API_KEY = "AIzaSyA5xcQTKIB5nlCd0LHrvLJwN6Ndb84Svoo";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY;

// === AI SERVICE ===
export const GeminiService = {
    async generateQuizQuestion(topic) {
        const prompt = 'Generate 1 quiz question about "' + topic + '" for a beginner English learner. ' +
            'Randomly choose between a "multiple_choice" authentication or a "speak_sentence" question. ' +
            'Return ONLY a raw JSON object (no markdown formatting, no backticks) with this structure: ' +
            '{ "type": "multiple_choice" OR "speak_sentence", "question": "The question text", "options": ["A", "B", "C", "D"], "correctIndex": 0, "targetSentence": "Sentence to speak", "explanation": "Explanation here." }';

        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            // Check if candidate exists
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error("Invalid API response format");
            }
            const text = data.candidates[0].content.parts[0].text;
            // Clean up if model adds markdown blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error("AI Generation Failed:", error);

            // Fallback content pool
            const fallbacks = [
                {
                    type: "multiple_choice",
                    question: "Which of these is a color?",
                    options: ["Apple", "Blue", "Car", "Dog"],
                    correctIndex: 1,
                    explanation: "Blue is a primary color."
                },
                {
                    type: "multiple_choice",
                    question: "What comes after the number 2?",
                    options: ["1", "5", "3", "4"],
                    correctIndex: 2,
                    explanation: "The count is 1, 2, 3..."
                },
                {
                    type: "speak_sentence",
                    targetSentence: "I love learning",
                    explanation: "Say this sentence clearly."
                },
                {
                    type: "multiple_choice",
                    question: "Which animal says 'Meow'?",
                    options: ["Dog", "Cat", "Cow", "Duck"],
                    correctIndex: 1,
                    explanation: "Cats say meow!"
                },
                {
                    type: "speak_sentence",
                    targetSentence: "Hello friend",
                    explanation: "A friendly greeting."
                }
            ];

            // Return random fallback
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
    }
};
