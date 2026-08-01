import  { useState } from 'react';
import { callGeminiAPI, copyToClipboard } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function EmailGenerator() {
    const [purpose, setPurpose] = useState('');
    const [recipient, setRecipient] = useState('');
    const [tone, setTone] = useState('Professional');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const handleGenerate = async () => {
        if (!purpose || !recipient) return;
        setLoading(true); setError(null); setResult(null);
        const sysPrompt = "You are a communication assistant. Format in Markdown. Provide: 1. Subject Line. 2. Alt Subject Line. 3. Short Email Version. 4. Formal Email Version."+ getLanguageInstruction();
        const res = await callGeminiAPI(`Recipient: ${recipient}\nPurpose: ${purpose}\nTone: ${tone}`, sysPrompt);
        if (res.success) setResult(res.text); else setError(res.text);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center"><i className="fas fa-envelope text-indigo-500 mr-3"></i>Email Generator</h2>
                <div className="space-y-4">
                    <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none" placeholder="Recipient (e.g. Prof. Smith)" value={recipient} onChange={e => setRecipient(e.target.value)} />
                    <textarea className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none resize-none" placeholder="Purpose..." value={purpose} onChange={e => setPurpose(e.target.value)} />
                    <select className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none" value={tone} onChange={e => setTone(e.target.value)}>
                        <option>Professional</option><option>Apologetic</option><option>Persuasive</option>
                    </select>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <Button variant="primary" onClick={handleGenerate} disabled={!purpose || !recipient || loading} icon="paper-plane">Draft Email</Button>
                </div>
            </div>
            {loading && <LoadingState message="Drafting email..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !result && !error && <EmptyState icon="inbox" title="Writer's Block?" description="Fill details above." />}
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