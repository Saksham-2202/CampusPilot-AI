import  { useState } from 'react';
import { callGeminiAPI, copyToClipboard } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function InterviewCoach() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const handleGenerate = async () => {
        if (!question || !answer) return;
        setLoading(true); setError(null); setResult(null);
        const sysPrompt = "You are a Recruiter. Output Markdown. Provide: 1. Score /10. 2. Strengths. 3. Weaknesses. 4. Improved Answer (STAR). 5. Follow-up Questions. 6. Hiring Recommendation."+ getLanguageInstruction();
        const res = await callGeminiAPI(`Question: ${question}\nCandidate Answer: ${answer}`, sysPrompt);
        if (res.success) setResult(res.text); else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center"><i className="fas fa-user-check text-indigo-500 mr-3"></i>Interview Coach</h2>
                <div className="space-y-4">
                    <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none" placeholder="Interview Question" value={question} onChange={e => setQuestion(e.target.value)} />
                    <textarea className="w-full h-32 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none resize-none" placeholder="Your Answer" value={answer} onChange={e => setAnswer(e.target.value)} />
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <Button variant="primary" onClick={handleGenerate} disabled={!question || !answer || loading} icon="comment-dots">Get Feedback</Button>
                </div>
            </div>
            {loading && <LoadingState message="Analyzing..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !result && !error && <EmptyState icon="microphone-alt" title="Mock Interview" description="Enter Q&A." />}
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