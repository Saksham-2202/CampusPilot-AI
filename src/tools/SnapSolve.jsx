// src/tools/SnapSolve.jsx
import { useState, useRef } from 'react';
import { callGeminiVisionAPI, copyToClipboard, downloadText } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function SnapSolve() {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [mimeType, setMimeType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const { getLanguageInstruction } = useLanguage();

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError("Please upload an image file (JPG, PNG, or WEBP).");
            return;
        }

        setError(null);
        setResult(null);
        setMimeType(file.type);

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            setImagePreview(dataUrl);
            const base64 = dataUrl.split(',')[1];
            setImageBase64(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleClear = () => {
        setImagePreview(null);
        setImageBase64(null);
        setMimeType(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerate = async () => {
        if (!imageBase64) return;
        setLoading(true); setError(null); setResult(null);

        const sysPrompt = `You are an expert tutor analyzing a photo of student material (notes, a textbook page, a whiteboard, or a homework problem). Format your output strictly in Markdown. Provide:
1. Extracted Text (transcribe exactly what is legible in the image).
2. If it contains a problem/question: a full Step-by-Step Solution.
3. Key Concepts involved.
4. A concise Summary.
5. Suggested Follow-up Practice (1-2 similar questions to try).
If the image is unclear or unreadable, say so plainly instead of guessing.`+ getLanguageInstruction();

        const res = await callGeminiVisionAPI(imageBase64, mimeType, "Analyze this image.", sysPrompt);

        if (res.success) setResult(res.text);
        else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center"><i className="fas fa-camera text-indigo-500 mr-3"></i>Snap & Solve</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Upload a photo of notes, a textbook page, or a problem — AI reads it and breaks it down instantly.</p>

                {!imagePreview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-56 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                    >
                        <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">Click to upload a photo</p>
                        <p className="text-slate-400 text-xs mt-1">JPG, PNG, or WEBP</p>
                    </div>
                ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={imagePreview} alt="Uploaded" className="w-full max-h-80 object-contain bg-slate-100 dark:bg-slate-900" />
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="mt-4 flex justify-end space-x-3">
                    {imagePreview && <Button variant="ghost" onClick={handleClear}>Clear</Button>}
                    {imagePreview && (
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon="sync">
                            Change Photo
                        </Button>
                    )}
                    <Button variant="primary" onClick={handleGenerate} disabled={!imageBase64 || loading} icon="magic">
                        Analyze Photo
                    </Button>
                </div>
            </div>

            {loading && <LoadingState message="Reading your photo & working through it..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}

            {!loading && !result && !error && (
                <EmptyState icon="camera-retro" title="Snap It, Solve It" description="Upload a photo of anything you're studying and get an instant, structured breakdown." />
            )}

            {result && (
                <div className="glass-card rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <Button variant="secondary" onClick={() => copyToClipboard(result)} icon="copy" className="text-xs py-1 px-3">Copy</Button>
                        <Button variant="secondary" onClick={() => downloadText('snap_solve.md', result)} icon="download" className="text-xs py-1 px-3">Download</Button>
                    </div>
                    <h3 className="text-xl font-bold mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">Breakdown</h3>
                    <MarkdownRenderer content={result} />
                </div>
            )}
        </div>
    );
}