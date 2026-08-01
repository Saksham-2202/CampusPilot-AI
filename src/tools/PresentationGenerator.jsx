import { useState } from 'react';
import { callGeminiAPI, copyToClipboard } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function PresentationGenerator() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true); setError(null); setResult(null);
        const sysPrompt = "You are a Presentation Coach. Output Markdown. Provide: 1. Title. 2. 10-Slide Outline. 3. Speaker Notes for Opening & Closing. 4. Top 3 Audience Questions."+ getLanguageInstruction();
        const res = await callGeminiAPI(`Topic: ${topic}`, sysPrompt);
        if (res.success) setResult(res.text); else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center"><i className="fas fa-desktop text-indigo-500 mr-3"></i>Presentation Generator</h2>
                <input type="text" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none" placeholder="Presentation Topic..." value={topic} onChange={e => setTopic(e.target.value)} />
                <div className="mt-4 flex justify-end space-x-3">
                    <Button variant="primary" onClick={handleGenerate} disabled={!topic || loading} icon="magic">Create Outline</Button>
                </div>
            </div>
            {loading && <LoadingState message="Structuring slides..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !result && !error && <EmptyState icon="project-diagram" title="Ace Presentation" description="Enter topic." />}
            {result && (
                <div className="glass-card rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4">
                        <Button variant="secondary" onClick={() => copyToClipboard(result)} icon="copy" className="text-xs py-1 px-3">Copy</Button>
                    </div>
                    <MarkdownRenderer content={result} />
                </div>
            )}
        </div>
    );
}
