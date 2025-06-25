
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { UserInput, GeneratedSchedule } from '../types';
import { GEMINI_MODEL_NAME, PLANTING_SCHEDULE_PROMPT_SYSTEM_INSTRUCTION, ASSISTANT_SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please ensure the API_KEY environment variable is configured.");
  // alert("API Key for Gemini is not configured. The application may not function correctly. Please check console for details.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); 

export const getPlantingSchedule = async (userInput: UserInput): Promise<GeneratedSchedule> => {
  if (!API_KEY) {
    throw new Error("API Key for Gemini is not configured. Please contact support or check environment variables.");
  }
  
  const userPrompt = `
  User Input:
  - Location: ${userInput.location}
  - Gardening Space Type: ${userInput.spaceType}
  - Gardening Goals: ${userInput.goals}
  - Experience Level: ${userInput.experienceLevel}
  ${userInput.specificPlants ? `- Specific Plants of Interest: ${userInput.specificPlants}` : ''}

  Please generate the personalized planting schedule based on this information and the system instructions.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: PLANTING_SCHEDULE_PROMPT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json", // Requesting JSON explicitly
      },
    });

    let jsonToParse = response.text.trim();
    
    // Strategy 1: Try to extract from ```json ... ``` or ``` ... ```
    // This regex handles optional "json" language identifier and captures the content.
    const markdownFenceRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/s;
    const fenceMatch = jsonToParse.match(markdownFenceRegex);

    if (fenceMatch && fenceMatch[1]) {
        jsonToParse = fenceMatch[1].trim();
    } else {
        // Strategy 2: If not clearly fenced, try to find the outermost JSON object or array.
        // This helps strip leading/trailing non-JSON text if the core is an object/array.
        // We look for the first '{' and last '}' or first '[' and last ']'.
        let firstOpenBrace = jsonToParse.indexOf('{');
        let lastCloseBrace = jsonToParse.lastIndexOf('}');
        let firstOpenBracket = jsonToParse.indexOf('[');
        let lastCloseBracket = jsonToParse.lastIndexOf(']');

        // Determine if the primary structure is an object or an array
        // and if it seems to form the core of the string.
        if (firstOpenBrace !== -1 && lastCloseBrace > firstOpenBrace &&
            (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket || (jsonToParse.endsWith('}') && !jsonToParse.endsWith(']')))
           ) {
            // Potential JSON object detected
            // Ensure it's the dominant part of the string or the string is just the object
             if (jsonToParse.substring(0, firstOpenBrace).trim() === "" && jsonToParse.substring(lastCloseBrace + 1).trim() === "") {
                 jsonToParse = jsonToParse.substring(firstOpenBrace, lastCloseBrace + 1);
             } else if (jsonToParse.startsWith("{") && jsonToParse.endsWith("}")) { // If it's already a clean object string
                 // jsonToParse is likely fine
             }
             // If it's embedded with significant other text, this strategy might be too aggressive
             // For now, if it's not a clean extraction, let it pass to JSON.parse to decide
        } else if (firstOpenBracket !== -1 && lastCloseBracket > firstOpenBracket) {
            // Potential JSON array detected
            if (jsonToParse.substring(0, firstOpenBracket).trim() === "" && jsonToParse.substring(lastCloseBracket + 1).trim() === "") {
                jsonToParse = jsonToParse.substring(firstOpenBracket, lastCloseBracket + 1);
            } else if (jsonToParse.startsWith("[") && jsonToParse.endsWith("]")) {
                // jsonToParse is likely fine
            }
        }
    }

    try {
      const parsedData: GeneratedSchedule = JSON.parse(jsonToParse);
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini for schedule:", parseError);
      console.error("Attempted to parse string:", jsonToParse); // Log the string that actually failed parsing
      console.error("Original raw Gemini schedule response text:", response.text);
      
      let userErrorMessage = "Received an invalid schedule format from the AI. ";
      if (parseError instanceof Error) {
          userErrorMessage += `Details: ${parseError.message}. `;
      }
      userErrorMessage += "The AI's response might be malformed or not valid JSON. Please try again or simplify your request.";
      throw new Error(userErrorMessage);
    }

  } catch (error) { // This catch is for the ai.models.generateContent call
    console.error("Error fetching planting schedule from Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("The provided API Key for schedule generation is not valid. Please check your API key configuration.");
        }
         throw new Error(`Failed to generate schedule: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the planting schedule.");
  }
};

// --- AI Assistant Chat Functions ---

export const startAppAssistantChat = (): Chat => {
  if (!API_KEY) {
    console.error("API Key for Gemini is not configured. Assistant chat cannot be started.");
    throw new Error("API Key for Gemini is not configured. Assistant chat cannot be started.");
  }
  return ai.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
    }
  });
};

export const sendMessageToAssistantChat = async (chat: Chat, message: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key for Gemini is not configured. Cannot send message to assistant.");
  }
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to assistant chat:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key not valid")) {
           throw new Error("The provided API Key for the assistant is not valid. Please check your API key configuration.");
      }
       throw new Error(`Assistant error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the assistant.");
  }
};
