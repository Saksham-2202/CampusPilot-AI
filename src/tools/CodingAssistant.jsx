import  { useState } from 'react';
import { callGeminiAPI, copyToClipboard } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function CodingAssistant() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const handleGenerate = async () => {
        if (!code.trim()) return;
        setLoading(true); setError(null); setResult(null);
        const sysPrompt = "You are a Senior Software Engineer. Format in Markdown. Provide: 1. Code Explanation. 2. Potential Bugs. 3. Suggested Improvements. 4. Time Complexity. 5. Space Complexity. 6. Optimized Version of the code."+ getLanguageInstruction();
        const res = await callGeminiAPI(`Review this code:\n\n\`\`\`\n${code}\n\`\`\``, sysPrompt);
        if (res.success) setResult(res.text); else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center"><i className="fas fa-laptop-code text-indigo-500 mr-3"></i>Coding Assistant</h2>
                <textarea className="w-full h-56 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-green-400 font-mono text-sm outline-none resize-none" placeholder="// Paste code here..." value={code} onChange={(e) => setCode(e.target.value)} />
                <div className="mt-4 flex justify-end space-x-3">
                    {code && <Button variant="ghost" onClick={() => setCode('')}>Clear</Button>}
                    <Button variant="primary" onClick={handleGenerate} disabled={!code.trim() || loading} icon="bug">Analyze Code</Button>
                </div>
            </div>
            {loading && <LoadingState message="Debugging..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !result && !error && <EmptyState icon="code" title="Need Review?" description="Paste code snippet." />}
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