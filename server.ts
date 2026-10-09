import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { matchProvidersForQuery } from './src/data/careProviders.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize GoogleGenAI SDK with user agent as per guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Audio Transcription using gemini-3.5-transcribe
app.post('/api/transcribe-audio', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment' });
    }

    // Clean audio base64 if it has data URL prefix
    const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this hospital discharge audio note, doctor voice dictation, or patient voice input verbatim into clinical text. Preserve medical terms, drug names, dosages, instructions, and dates.',
          },
        ],
      },
    });

    const transcription = response.text || '';
    return res.json({ text: transcription });
  } catch (err: any) {
    console.error('Audio transcription error:', err);
    return res.status(500).json({
      error: 'Failed to transcribe audio: ' + (err?.message || 'Unknown error'),
    });
  }
});

// Text-to-Speech using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No text provided for TTS' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const cleanText = text.slice(0, 1000);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, empathetic, calming healthcare assistant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Audio could not be generated' });
    }

    return res.json({ audioBase64: base64Audio, format: 'audio/wav' });
  } catch (err: any) {
    console.error('TTS error:', err);
    return res.status(500).json({
      error: 'Text-to-speech error: ' + (err?.message || 'Unknown error'),
    });
  }
});

// Master Discharge Summary Analysis Pipeline
app.post('/api/analyze-discharge', async (req: Request, res: Response) => {
  try {
    const {
      dischargeText,
      fileData,
      mimeType,
      fileName,
      targetLanguage = 'Hindi',
      modelChoice = 'gemini-3.5-flash',
    } = req.body;

    const hasText = dischargeText && dischargeText.trim().length > 0;
    const hasFile = fileData && fileData.trim().length > 0;

    // RULE 1: STRICT ZERO DEMO DATA POLICY
    if (!hasText && !hasFile) {
      return res.status(400).json({
        error: 'No patient record detected. Please upload or paste a valid discharge summary or medical report to generate a recovery plan.',
      });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    const systemInstruction = `You are "Aegis", an Agentic Post-Discharge Care Coordinator AI. Your sole purpose is to analyze user-uploaded patient discharge summaries, lab reports, medical PDFs, and clinical records to generate structured, safe, and patient-friendly recovery plans.

### MANDATORY OPERATING RULES:
1. STRICT DYNAMIC PROCESSING & ZERO DEMO DATA POLICY:
   - NEVER rely on hardcoded, pre-populated, static sample data, mock values, or default patient examples.
   - Generate all analyses, metrics, timelines, tasks, and translations EXCLUSIVELY from the specific patient document or data payload provided in the current request.
   - If NO patient record or discharge summary is detected in the input, STOP and reply with:
     "No patient record detected. Please upload or paste a valid discharge summary or medical report to generate a recovery plan."

2. CLINICAL EXTRACTION & ANALYSIS:
   - Dynamically parse all patient demographics, clinical history, and diagnostic metrics present in the upload (including PDF document tables, headers, and prescriptions).
   - Identify medications (drug name, dose, frequency, duration, purpose).
   - Extract scheduled follow-up appointments, lab tests, imaging, and specialist referrals with explicit dates or relative timeframes present in the document.
   - Extract general care instructions (wound care, physical restrictions, diet, bathing).
   - Extract critical warning signs/red-flag symptoms mentioned in the document.

3. SIMPLIFICATION & TRANSLATION:
   - Rewrite all instructions extracted from the input into simple, 5th-grade reading level English.
   - Provide side-by-side translation into the requested target language (${targetLanguage}) based strictly on the extracted content.

4. TASK SCHEDULING & STATUS ALLOCATION:
   - Assign initial task status based solely on extracted findings:
     * "Pending": Clear, actionable task with defined dates/times.
     * "Needs Review": Ambiguous instruction, missing dosage, unverified appointment, or missing critical parameters.
     * "Completed": Pre-existing completed post-op checks or immediate pre-requisites noted in the file.
   - Suggest time_of_day where relevant: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'Anytime'.

5. MISSING DATA & ESCALATION GUARDRAILS (Agent 4 Guardrail & Safety):
   - If a standard clinical field is not present in the uploaded document, mark it as "Data Not Provided in Upload" instead of fabricating values.
   - Set "requires_human_escalation: true" whenever:
     * Instructions are unclear or ambiguous.
     * Medication dosage or frequency is missing or vague (e.g. "take blood thinner as tolerated").
     * High-risk symptoms or critical clinical alert thresholds are detected.
     * Medical ambiguity exists in the input file.
   - Provide explicit "escalation_reason" when requires_human_escalation is true.
   - NEVER diagnose conditions, alter prescribed medication dosages, or invent treatments not listed in the upload.

6. PROVIDER MATCHING QUERIES (Agent 5 Provider Matcher):
   - For every appointment, diagnostic test, or referral, emit a provider query with facility type, required specialty, and location hint.

7. AI CONFIDENCE SCORE SCORING RUBRIC (Integer between 45 and 99):
   Calculate a genuine, differentiated extraction confidence score for EACH task individually based on clinical precision:
   - 92 to 99: High Certainty — completely explicit order with exact drug name, exact milligram dose, explicit route, exact frequency, or concrete appointment date.
   - 80 to 91: Moderate-High Certainty — clear clinical instructions with relative or inferred timeframes (e.g., "in 10 days", "after meals", "in 2 weeks").
   - 65 to 79: Moderate/Uncertain — partially defined instructions, PRN without max limits, vague activity advice, or missing non-critical parameters.
   - 45 to 64: Low Certainty / High Risk — missing critical dosages (e.g., "Aspirin: resume as indicated" without mg), ambiguous instructions, or any item flagged with requires_human_escalation: true.
   DO NOT give all tasks identical scores. Differentiate each task based on its specific textual clarity!

### REQUIRED OUTPUT FORMAT:
Always return valid JSON matching this exact structure:
{
  "patient_summary": {
    "extracted_patient_id": "String or Data Not Provided in Upload",
    "patient_name": "String or Data Not Provided in Upload",
    "diagnosis": "String or Data Not Provided in Upload",
    "discharge_date": "String or Data Not Provided in Upload",
    "simplified_english": "String",
    "simplified_indian_language": "String"
  },
  "clinical_vitals": {
    "bp": "String or null",
    "pulse": "String or null",
    "temperature": "String or null",
    "spo2": "String or null",
    "blood_sugar": "String or null",
    "allergies": ["String"]
  },
  "timeline_tasks": [
    {
      "task_id": "String (e.g. TASK-1)",
      "category": "medication" | "appointment" | "test" | "referral" | "care_instruction",
      "original_text": "String",
      "simplified_text_en": "String",
      "simplified_text_lang": "String",
      "due_date": "YYYY-MM-DD or relative offset extracted from document",
      "time_of_day": "Morning" | "Afternoon" | "Evening" | "Bedtime" | "Anytime",
      "status": "Pending" | "Completed" | "Needs Review",
      "requires_human_escalation": boolean,
      "escalation_reason": "String or null",
      "ai_confidence_score": 88
    }
  ],
  "warning_signs": [
    {
      "symptom": "String",
      "action_required": "String",
      "urgency": "High" | "Immediate Emergency"
    }
  ],
  "provider_matching_queries": [
    {
      "task_id": "String",
      "specialty_or_facility_needed": "String",
      "location_hint": "String"
    }
  ]
}`;

    const modelToUse = modelChoice || 'gemini-3.5-flash';

    // Build payload: if PDF/fileData is provided, send as inlineData part
    const parts: any[] = [];
    if (hasFile) {
      const base64Clean = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      const fileMime = mimeType || 'application/pdf';
      parts.push({
        inlineData: {
          mimeType: fileMime,
          data: base64Clean,
        },
      });
      parts.push({
        text: `Analyze this uploaded patient discharge PDF document (${fileName || 'Discharge_Document.pdf'})${hasText ? ` with additional clinician notes: ${dischargeText}` : ''} and dynamically extract all recovery instructions, medications, follow-ups, warning signs, and provider needs for target language ${targetLanguage}.`,
      });
    } else {
      parts.push({
        text: `Analyze this uploaded patient discharge note and dynamically extract all recovery instructions, medications, follow-ups, warning signs, and provider needs for target language ${targetLanguage}:\n\n${dischargeText}`,
      });
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: {
        parts,
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const rawText = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      // Clean JSON markers if present
      const cleaned = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleaned);
    }

    // Match care providers dynamically for each query
    const providerQueries = parsed.provider_matching_queries || [];
    const tasks = parsed.timeline_tasks || [];

    const enrichedTasks = tasks.map((task: any) => {
      let taskScore =
        typeof task.ai_confidence_score === 'number'
          ? Math.min(99, Math.max(45, Math.round(task.ai_confidence_score)))
          : task.requires_human_escalation
          ? 58
          : 88;

      // Ambiguous or escalated items cannot have high confidence
      if (task.requires_human_escalation && taskScore > 68) {
        taskScore = Math.min(68, Math.max(48, taskScore - 28));
      }

      const relatedQuery = providerQueries.find((q: any) => q.task_id === task.task_id);
      let matched = undefined;
      if (relatedQuery || ['test', 'appointment', 'referral'].includes(task.category)) {
        const queryText = (relatedQuery?.specialty_or_facility_needed || '') + ' ' + task.original_text;
        matched = matchProvidersForQuery(queryText, relatedQuery?.location_hint || '');
      }

      return {
        ...task,
        ai_confidence_score: taskScore,
        matched_providers: matched || task.matched_providers,
      };
    });

    const escalatedCount = enrichedTasks.filter((t: any) => t.requires_human_escalation).length;
    const avgConfidence =
      enrichedTasks.length > 0
        ? Math.round(
            enrichedTasks.reduce((acc: number, t: any) => acc + (t.ai_confidence_score || 95), 0) /
              enrichedTasks.length
          )
        : 95;

    const fullPlan = {
      patient_summary: parsed.patient_summary,
      clinical_vitals: parsed.clinical_vitals,
      timeline_tasks: enrichedTasks,
      warning_signs: parsed.warning_signs || [],
      provider_matching_queries: providerQueries,
      target_language: targetLanguage,
      analyzed_at: new Date().toISOString(),
      pipeline_metadata: {
        model_used: modelToUse,
        total_tasks: enrichedTasks.length,
        escalated_tasks_count: escalatedCount,
        safety_score: Math.max(70, 100 - escalatedCount * 10),
        ai_confidence_score: avgConfidence,
      },
    };

    return res.json(fullPlan);
  } catch (err: any) {
    console.error('Analyze discharge error:', err);
    return res.status(500).json({
      error: 'Clinical extraction failed: ' + (err?.message || 'Unknown error'),
    });
  }
});

// Patient / Caregiver Q&A regarding their specific discharge plan
app.post('/api/ask-coordinator', async (req: Request, res: Response) => {
  try {
    const { question, dischargePlan } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!dischargePlan) {
      return res.status(400).json({ error: 'Discharge context is required' });
    }

    const prompt = `You are Aegis, the post-discharge recovery coordinator answering a patient or family caregiver's question.
Here is the patient's verified discharge summary context:
Patient: ${dischargePlan.patient_summary?.patient_name || 'Patient'}
Diagnosis: ${dischargePlan.patient_summary?.diagnosis || 'Post-discharge'}
Medications & Tasks:
${(dischargePlan.timeline_tasks || []).map((t: any) => `- [${t.category}] ${t.simplified_text_en} (Original: ${t.original_text})`).join('\n')}
Warning Signs:
${(dischargePlan.warning_signs || []).map((w: any) => `- ${w.symptom}: ${w.action_required} (${w.urgency})`).join('\n')}

Patient/Caregiver Question: "${question}"

GUIDELINES:
1. Answer in warm, reassuring, plain 5th-grade English.
2. Ground your answer strictly in the patient's verified discharge orders above.
3. NEVER prescribe new medications or change dosages.
4. If the question asks about severe red flags (e.g., chest pain, fever >101°F, breathing difficulty, bleeding), clearly direct them to ER / emergency hotline immediately.
5. If something is not in the discharge record, state clearly that their physician should be consulted.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    return res.json({ answer: response.text || '' });
  } catch (err: any) {
    console.error('Ask coordinator error:', err);
    return res.status(500).json({
      error: 'Failed to process question: ' + (err?.message || 'Unknown error'),
    });
  }
});

// Mount Vite or static server
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`[Aegis] Server running at http://0.0.0.0:${port}`);
});
