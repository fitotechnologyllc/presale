
import { GoogleGenAI, Type } from "@google/genai";
import type { NetworkInfo, FaqItem } from '../types';

export const config = {
  runtime: 'edge',
};

const getMockFaqs = (message: string): FaqItem[] => [
    { question: "What is Fitochain?", answer: `Fitochain is a revolutionary blockchain for the fitness industry. ${message}` },
    { question: "How can I participate in the presale?", answer: "Connect your wallet, enter the amount you wish to contribute, and confirm the transaction." },
    { question: "What is the price of FITO during the presale?", answer: "Please check the presale details section for the current price." },
];

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { API_KEY } = process.env;

    if (!API_KEY) {
        console.warn("Gemini API key not found on server. Returning mock data.");
        const mockFaqs = getMockFaqs("The API key is missing, so this is mock data.");
        return new Response(JSON.stringify(mockFaqs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { networkInfo }: { networkInfo: NetworkInfo } = await req.json();
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const prompt = `
            You are a helpful assistant for a cryptocurrency project called Fitochain.
            Your task is to generate a list of 5 frequently asked questions (FAQs) for their native coin presale.
            The project's network details are as follows:
            - Name: ${networkInfo.name} (${networkInfo.nativeCurrency.symbol})
            - Chain ID: ${networkInfo.chainId}
            - Info URL: ${networkInfo.infoURL}
            - Description: A blockchain for the decentralized fitness economy.

            Generate FAQs that are relevant to a potential investor in a presale. Cover topics like the project's purpose, how to buy, what wallets are supported, and the token's utility.
            Keep the answers concise and easy to understand.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        faqs: {
                            type: Type.ARRAY,
                            description: "A list of frequently asked questions and their answers.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING, description: "The frequently asked question." },
                                    answer: { type: Type.STRING, description: "The answer to the question." }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result.faqs && Array.isArray(result.faqs)) {
            return new Response(JSON.stringify(result.faqs), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        throw new Error("Invalid format from AI response");

    } catch (error) {
        console.error("Error in generateFaq handler:", error);
        const mockFaqs = getMockFaqs("There was an error fetching dynamic content from the AI.");
        return new Response(JSON.stringify(mockFaqs), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}