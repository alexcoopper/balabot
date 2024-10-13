import axios from 'axios';

const COHERE_API_KEY = process.env.COHERE_API_KEY || ''; // Replace with your API key
const COHERE_API_URL = 'https://api.cohere.ai/generate'; // Cohere API URL for text generation

export class AiServiceApi {
    async generateResponse(prompt: string): Promise<string> {
        try {
            console.log('AiServiceApi: Generating AI response...');
            const response = await axios.post(
                COHERE_API_URL,
                {
                    model: 'command-xlarge-nightly',
                    prompt: prompt,
                    max_tokens: 500,
                    temperature: 0.75,
                },
                {
                    headers: {
                        Authorization: `Bearer ${COHERE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('AiServiceApi: AI response generated successfully. Response:', response.data.text);
            return response.data.text;
        } catch (error: any) {
            console.error('Error generating AI response:', error?.response ? error?.response.data : error);
            return 'Sorry, something went wrong while generating the response.';
        }
    }
}
