import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TryOnParams {
  clothingImageBase64: string;
  modelImageBase64: string;
  style: string;
}

export async function generateTryOn(params: TryOnParams): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: params.modelImageBase64.split(",")[1],
              mimeType: "image/png",
            },
          },
          {
            inlineData: {
              data: params.clothingImageBase64.split(",")[1],
              mimeType: "image/png",
            },
          },
          {
            text: `Please perform a virtual try-on. Naturally place the clothing from the second image onto the person in the first image. Maintain the ${params.style} aesthetic, which is minimalist, high-end, and sophisticated like Max Mara. Ensure the lighting and textures blend seamlessly. Output only the modified image.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
}
