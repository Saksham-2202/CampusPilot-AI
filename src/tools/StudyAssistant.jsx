// src/tools/StudyAssistant.jsx
import { useState } from 'react';
import { callGeminiAPI, copyToClipboard, downloadText } from '../lib/gemini';
import { useLanguage } from '../context/LanguageContext';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';

export default function StudyAssistant() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setLoading(true); setError(null); setResult(null);

        const sysPrompt = "You are an expert Study Assistant. Your goal is to help students learn effectively. Format your output strictly in Markdown. Use clear headings, bullet points, and bold text. Provide: 1. A concise Summary. 2. Important Points to remember. 3. Exam Tips based on the content. 4. 5-7 Flashcards (Format as Q: ... / A: ...). 5. Key Formulas/Dates (if applicable). 6. A clever Memory Trick (Mnemonic). 7. Estimated Revision Time."
            + getLanguageInstruction();

        const res = await callGeminiAPI(`Analyze these notes:\n\n${input}`, sysPrompt);

        if (res.success) setResult(res.text);
        else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center"><i className="fas fa-book-open text-indigo-500 mr-3"></i>Study Assistant</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Paste your lecture notes, textbook excerpts, or articles to instantly generate study materials.</p>

                <textarea
                    className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-shadow"
                    placeholder="Paste your notes here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <div className="mt-4 flex justify-end space-x-3">
                    {input && <Button variant="ghost" onClick={() => setInput('')}>Clear</Button>}
                    <Button variant="primary" onClick={handleGenerate} disabled={!input.trim() || loading} icon="magic">
                        Generate Study Guide
                    </Button>
                </div>
            </div>

            {loading && <LoadingState message="Analyzing notes & generating study materials..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}

            {!loading && !result && !error && (
                <EmptyState icon="graduation-cap" title="Ready to Study?" description="Paste your notes above and let AI create summaries, flashcards, and study tips for you." />
            )}

            {result && (
                <div className="glass-card rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <Button variant="secondary" onClick={() => copyToClipboard(result)} icon="copy" className="text-xs py-1 px-3">Copy</Button>
                        <Button variant="secondary" onClick={() => downloadText('study_guide.md', result)} icon="download" className="text-xs py-1 px-3">Download</Button>
                    </div>
                    <h3 className="text-xl font-bold mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">Your Study Guide</h3>
                    <MarkdownRenderer content={result} />
                </div>
            )}
        </div>
    );
}