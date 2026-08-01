// src/lib/gemini.js
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 1. Text Generation
const textApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

export async function callGeminiAPI(prompt, systemInstruction = "") {
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    };
    try {
        const response = await fetch(textApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return { success: true, text: candidate.content.parts[0].text };
        }
        return { success: false, text: "Received an empty response from AI." };
    } catch (error) {
        console.error("API Error:", error);
        return { success: false, text: "Failed to connect to the AI." };
    }
}

// 2. Vision — image understanding (free tier)
export async function callGeminiVisionAPI(base64Data, mimeType, prompt, systemInstruction = "") {
    const payload = {
        contents: [{
            parts: [
                { inlineData: { mimeType: mimeType, data: base64Data } },
                { text: prompt }
            ]
        }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    };
    try {
        const response = await fetch(textApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return { success: true, text: candidate.content.parts[0].text };
        }
        return { success: false, text: "Received an empty response from AI." };
    } catch (error) {
        console.error("Vision API Error:", error);
        return { success: false, text: "Failed to analyze the image. Please try again." };
    }
}

// 3. Image Generation (paid tier only)
const imageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

export async function callImagenAPI(prompt) {
    const payload = { instances: [{ prompt: prompt }], parameters: { sampleCount: 1 } };
    try {
        const response = await fetch(imageApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Image Generation Failed");
        const result = await response.json();
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            return { success: true, imageUrl: `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}` };
        }
        return { success: false, text: "No image data returned." };
    } catch (error) {
        return { success: false, text: error.message };
    }
}

// 4. TTS (paid tier only)
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

function pcmToWav(pcmData, sampleRate) {
    const numChannels = 1;
    const byteRate = sampleRate * numChannels * 2;
    const blockAlign = numChannels * 2;
    const buffer = new ArrayBuffer(44 + pcmData.byteLength);
    const view = new DataView(buffer);
    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.byteLength, true);
    new Int16Array(buffer, 44).set(new Int16Array(pcmData));
    return new Blob([buffer], { type: 'audio/wav' });
}

const ttsApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;

export async function callTTSAPI(scriptText) {
    const payload = {
        contents: [{ parts: [{ text: scriptText }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: "Host 1", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } },
                        { speaker: "Host 2", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } }
                    ]
                }
            }
        }
    };
    try {
        const response = await fetch(ttsApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("TTS Audio Generation Failed");
        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType;
        if (audioData && mimeType && mimeType.startsWith("audio/")) {
            const sampleRateMatch = mimeType.match(/rate=(\d+)/);
            const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
            const pcmData = base64ToArrayBuffer(audioData);
            const wavBlob = pcmToWav(pcmData, sampleRate);
            return { success: true, audioUrl: URL.createObjectURL(wavBlob) };
        }
        return { success: false, text: "No audio data returned." };
    } catch (error) {
        return { success: false, text: error.message };
    }
}

// Utilities
export const copyToClipboard = (text) => navigator.clipboard.writeText(text);
export const downloadText = (filename, text) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

// 5. Audio understanding — voice notes / lecture clips (free tier)
export async function callGeminiAudioAPI(base64Data, mimeType, prompt, systemInstruction = "") {
    const payload = {
        contents: [{
            parts: [
                { inlineData: { mimeType: mimeType, data: base64Data } },
                { text: prompt }
            ]
        }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    };
    try {
        const response = await fetch(textApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return { success: true, text: candidate.content.parts[0].text };
        }
        return { success: false, text: "Received an empty response from AI." };
    } catch (error) {
        console.error("Audio API Error:", error);
        return { success: false, text: "Failed to process the audio. Please try again." };
    }
}

// Add to src/lib/gemini.js

// 6. Structured JSON generation (for anything that needs a real data shape, not prose)
export async function callGeminiJSON(prompt, systemInstruction = "") {
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
            responseMimeType: "application/json"
        }
    };
    try {
        const response = await fetch(textApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const candidate = result.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text;
        if (!rawText) return { success: false, text: "Received an empty response from AI." };

        const parsed = JSON.parse(rawText);
        return { success: true, data: parsed };
    } catch (error) {
        console.error("JSON API Error:", error);
        return { success: false, text: "Failed to generate structured data. Please try again." };
    }
}