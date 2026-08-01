import { useState } from 'react';
import { callGeminiAPI, copyToClipboard } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function StudyPlanner() {
    const [subjects, setSubjects] = useState('');
    const [hours, setHours] = useState('4');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const handleGenerate = async () => {
        if (!subjects) return;
        setLoading(true); setError(null); setResult(null);
        const sysPrompt = "You are an Academic Planner. Format in Markdown. Provide: 1. Daily Timetable. 2. Weekly Plan. 3. Revision Plan. 4. Motivation Tips." + getLanguageInstruction();
        const res = await callGeminiAPI(`Subjects: ${subjects}\nHours/Day: ${hours}`, sysPrompt);
        if (res.success) setResult(res.text); else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center"><i className="fas fa-calendar-alt text-indigo-500 mr-3"></i>Study Planner</h2>
                <div className="space-y-4">
                    <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none" placeholder="Subjects (e.g. Math, Physics)" value={subjects} onChange={e => setSubjects(e.target.value)} />
                    <input type="number" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none" placeholder="Daily Hours" value={hours} onChange={e => setHours(e.target.value)} />
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <Button variant="primary" onClick={handleGenerate} disabled={!subjects || loading} icon="calendar-check">Generate Plan</Button>
                </div>
            </div>
            {loading && <LoadingState message="Building schedule..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !result && !error && <EmptyState icon="clock" title="Plan Time" description="Enter subjects." />}
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