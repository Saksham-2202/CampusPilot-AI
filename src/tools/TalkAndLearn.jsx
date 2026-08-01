// src/tools/TalkAndLearn.jsx
import { useState, useRef } from 'react';
import { callGeminiAudioAPI, copyToClipboard, downloadText } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function TalkAndLearn() {
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBase64, setAudioBase64] = useState(null);
    const [mimeType, setMimeType] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);

    const blobToBase64AndUrl = (blob) => {
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setMimeType(blob.type);
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result.split(',')[1];
            setAudioBase64(base64);
        };
        reader.readAsDataURL(blob);
    };

    const startRecording = async () => {
        setError(null); setResult(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];

            const mimeCandidate = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/mp4';

            const recorder = new MediaRecorder(stream, { mimeType: mimeCandidate });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeCandidate });
                blobToBase64AndUrl(blob);
                streamRef.current?.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic access error:", err);
            setError("Couldn't access your microphone. Check browser permissions, or upload an audio file instead.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            setError("Please upload an audio file (MP3, WAV, M4A, or WEBM).");
            return;
        }

        setError(null); setResult(null);
        blobToBase64AndUrl(file);
    };

    const handleClear = () => {
        setAudioUrl(null);
        setAudioBase64(null);
        setMimeType(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerate = async () => {
        if (!audioBase64) return;
        setLoading(true); setError(null); setResult(null);

        const sysPrompt = `You are an expert tutor and note-taker analyzing an audio recording from a student. First, determine what the audio actually is:
- If it is a QUESTION (the speaker is asking something, seeking an explanation, or asking for help), your top priority is to ANSWER it directly and thoroughly — treat this like a real question that needs a real answer, not just something to summarize.
- If it is a LECTURE, explanation, or notes being read aloud, treat it as content to capture and organize.

Format your output strictly in Markdown, using whichever of these sections actually apply:
1. Full Transcript (as accurately as possible).
2. Direct Answer — if the audio contains a question, answer it fully and clearly here. Skip this section only if no question was asked.
3. Summary of what was said.
4. Key Points / Takeaways.
5. Action Items (only if the speaker stated a task or intention).
6. Suggested Follow-up Questions to deepen understanding of the topic.
If the audio is unclear or silent, say so plainly instead of guessing.`+ getLanguageInstruction();
        const res = await callGeminiAudioAPI(audioBase64, mimeType, "Analyze this audio.", sysPrompt);

        if (res.success) setResult(res.text);
        else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center"><i className="fas fa-microphone-alt text-indigo-500 mr-3"></i>Talk & Learn</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Record a voice note or upload a lecture clip — AI transcribes it and turns it into structured notes.</p>

                {!audioUrl ? (
                    <div className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 flex flex-col items-center justify-center">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all duration-200 ${isRecording ? 'bg-red-500 animate-pulse-slow scale-110' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}`}
                        >
                            <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                        </button>
                        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {isRecording ? 'Recording... click to stop' : 'Click to start recording'}
                        </p>

                        <div className="flex items-center w-full max-w-xs my-6">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                            <span className="px-3 text-xs text-slate-400 font-medium">OR</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                        </div>

                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon="file-upload">
                            Upload Audio File
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center">
                        <i className="fas fa-waveform-lines text-3xl text-indigo-500 mb-3"></i>
                        <audio controls src={audioUrl} className="w-full max-w-sm" />
                    </div>
                )}

                <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="mt-4 flex justify-end space-x-3">
                    {audioUrl && <Button variant="ghost" onClick={handleClear}>Clear</Button>}
                    <Button variant="primary" onClick={handleGenerate} disabled={!audioBase64 || loading} icon="magic">
                        Generate Notes
                    </Button>
                </div>
            </div>

            {loading && <LoadingState message="Listening & taking notes..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}

            {!loading && !result && !error && (
                <EmptyState icon="headphones-alt" title="Talk It Out" description="Record a thought or upload a clip and get an instant transcript with structured notes." />
            )}

            {result && (
                <div className="glass-card rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <Button variant="secondary" onClick={() => copyToClipboard(result)} icon="copy" className="text-xs py-1 px-3">Copy</Button>
                        <Button variant="secondary" onClick={() => downloadText('talk_notes.md', result)} icon="download" className="text-xs py-1 px-3">Download</Button>
                    </div>
                    <h3 className="text-xl font-bold mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">Notes</h3>
                    <MarkdownRenderer content={result} />
                </div>
            )}
        </div>
    );
}