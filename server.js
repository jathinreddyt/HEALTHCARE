require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/generate-diet', async (req, res) => {
    try {
        const { name, age, goal, dietType, allergies } = req.body;

        // Create detailed prompt for OpenAI
        const prompt = `
            Create a personalized ${dietType} diet plan for:
            - Name: ${name}
            - Age: ${age}
            - Primary Goal: ${goal.replace('_', ' ')}
            ${allergies ? `- Allergies/Restrictions: ${allergies}` : ''}

            Include:
            1. Daily calorie target based on goal
            2. Macronutrient breakdown (protein, carbs, fats)
            3. 7-day meal plan (breakfast, lunch, dinner, snacks)
            4. 5 specific recommendations
            
            Format the response as JSON with these fields:
            {
                "name": string,
                "age": number,
                "goal": string,
                "dietType": string,
                "allergies": string,
                "calories": string,
                "macros": string,
                "meals": array of {
                    "day": string,
                    "breakfast": string,
                    "lunch": string,
                    "dinner": string,
                    "snacks": string
                },
                "recommendations": array of strings
            }
        `;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: "You are an expert nutritionist AI that creates detailed, personalized diet plans." 
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        });

        // Parse and return the AI response
        const dietPlan = JSON.parse(response.choices[0].message.content);
        res.json(dietPlan);

    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ 
            error: "Failed to generate diet plan",
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});