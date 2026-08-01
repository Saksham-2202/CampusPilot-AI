import  { useState } from 'react';
import { callGeminiAPI, copyToClipboard } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function ResumeAssistant() {
    const [resume, setResume] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const handleGenerate = async () => {
        if (!resume.trim()) return;
        setLoading(true); setError(null); setResult(null);
        const sysPrompt = "You are an ATS Specialist. Format in Markdown. Provide: 1. ATS Score. 2. Missing Keywords. 3. Improved Bullet Points. 4. Formatting Fixes. 5. Generated Summary. 6. Cover Letter Draft. 7. Interview Readiness Score."+ getLanguageInstruction();
        const res = await callGeminiAPI(`Review this resume:\n\n${resume}`, sysPrompt);
        if (res.success) setResult(res.text); else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center"><i className="fas fa-file-alt text-indigo-500 mr-3"></i>Resume Assistant</h2>
                <textarea className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none resize-none" placeholder="Paste resume here..." value={resume} onChange={(e) => setResume(e.target.value)} />
                <div className="mt-4 flex justify-end space-x-3">
                    {resume && <Button variant="ghost" onClick={() => setResume('')}>Clear</Button>}
                    <Button variant="primary" onClick={handleGenerate} disabled={!resume.trim() || loading} icon="search">Analyze Resume</Button>
                </div>
            </div>
            {loading && <LoadingState message="Scanning ATS..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !result && !error && <EmptyState icon="user-tie" title="Land the Job" description="Paste resume text." />}
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