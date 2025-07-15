
import { GoogleGenAI, Type } from "@google/genai";
import { FaqItem, NetworkInfo } from '../types';

// IMPORTANT: This key is managed by the environment and must not be hardcoded.
// The execution environment is responsible for setting `process.env.API_KEY`.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. FAQ generation will be disabled and mock data will be used.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateFaqContent = async (networkInfo: NetworkInfo): Promise<FaqItem[]> => {
  if (!API_KEY) {
    // Return mock data if API key is not available
    return [
      { question: "What is Fitochain?", answer: "Fitochain is a revolutionary blockchain for the fitness industry. The API key is missing, so this is mock data." },
      { question: "How can I participate in the presale?", answer: "Connect your wallet, enter the amount you wish to contribute, and confirm the transaction." },
      { question: "What is the price of FITO during the presale?", answer: "Please check the presale details section for the current price." },
      { question: "Which wallets are supported?", answer: "Any wallet that supports custom EVM networks, like MetaMask or Trust Wallet, can be used."}
    ];
  }

  try {
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
                  question: {
                    type: Type.STRING,
                    description: "The frequently asked question."
                  },
                  answer: {
                    type: Type.STRING,
                    description: "The answer to the question."
                  }
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
      return result.faqs;
    }
    
    return [];

  } catch (error) {
    console.error("Error generating FAQ content with Gemini:", error);
    // Return fallback content on error
    return [
        { question: "What is Fitochain?", answer: "Fitochain is a revolutionary blockchain for the fitness industry. There was an error fetching dynamic content." },
        { question: "How can I participate in the presale?", answer: "Connect your wallet, enter the amount you wish to contribute, and confirm the transaction." },
    ];
  }
};