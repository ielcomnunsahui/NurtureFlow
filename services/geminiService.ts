
import { GoogleGenAI, Type } from "@google/genai";
import { Patient, Visit } from "../types";

export const getAIRecommendation = async (patient: Patient) => {
  // Fix: Initializing GoogleGenAI with exactly the process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Context: Clinical Decision Support for Family Planning in low-resource settings.
    Patient Profile:
    - Age: ${patient.age}
    - Children: ${patient.childrenCount}
    - Medical History: ${patient.fpHistory}
    - Preferred Method: ${patient.currentMethod}
    
    Task: Based on WHO Medical Eligibility Criteria (MEC), provide non-diagnostic decision support.
    Highlight potential contraindications or considerations for their preferred method.
    DO NOT provide a definitive diagnosis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Public Health Assistant specialized in WHO Family Planning guidelines. Your advice is non-diagnostic and for clinician use only.",
        temperature: 0.5,
      },
    });
    // Fix: access response.text directly as a property
    return response.text || "Unable to generate recommendation at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insights currently offline. Please refer to WHO MEC wheel.";
  }
};

export const generateVisitSummary = async (patient: Patient, visit: Visit) => {
  // Fix: Initializing GoogleGenAI with exactly the process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Create a concise clinical summary for the following patient visit:
    Patient: ${patient.fullName}
    Age: ${patient.age}
    Action: ${visit.methodProvided} administered on ${visit.visitDate}
    Next Appointment: ${visit.nextAppointmentDate}
    Nurse Notes: ${visit.notes}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a clinical documentation assistant. Create brief, standard-compliant medical summaries.",
        // Fix: Added thinkingBudget as recommended when setting maxOutputTokens for Gemini 3 models
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 100 },
      },
    });
    // Fix: access response.text directly as a property
    return response.text;
  } catch (error) {
    console.error("Summary generation failed:", error);
    return "Summary generation failed.";
  }
};
