// src/tools/ResearchAssistant.jsx
import { useState } from 'react';
import { callGeminiAPI, callImagenAPI, copyToClipboard } from '../lib/gemini';
import { Button, MarkdownRenderer, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

export default function ResearchAssistant() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);

    // Multi-modal state
    const [resultText, setResultText] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    // Interactive Quiz State
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showScores, setShowScores] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        // Reset states
        setLoading(true); setError(null); setResultText(null);
        setImageUrl(null); setQuiz(null); setShowScores(false); setSelectedAnswers({});

        // 1. Text & JSON Prompt (Gemini)
        const sysPrompt = `You are a Research Assistant. Output exactly two parts separated by "---QUIZ---".
PART 1: Markdown text containing an Overview, Key Concepts, and Future Scope.
PART 2: A strict JSON array of 3 multiple-choice questions testing the user on the content.
Format EXACTLY like this: [{"q": "Question?", "options": ["A", "B", "C", "D"], "answer": 0}] (where answer is the correct index 0-3).`+ getLanguageInstruction();

        // 2. Image Prompt (Imagen 4.0)
        const imagePrompt = `A beautiful, abstract, high-quality 3D digital illustration representing the academic concept of: ${topic}. Clean, scientific, and futuristic style. No text or words in the image.`;

        // FIRE BOTH APIS SIMULTANEOUSLY FOR MAX SPEED
        const textPromise = callGeminiAPI(`Topic: ${topic}`, sysPrompt);
        const imagePromise = callImagenAPI(imagePrompt);

        const [textRes, imageRes] = await Promise.all([textPromise, imagePromise]);

        // Handle Text & JSON Parsing
        if (textRes.success) {
            try {
                const parts = textRes.text.split('---QUIZ---');
                setResultText(parts[0].trim());
                if (parts.length > 1) {
                    const jsonStr = parts[1].replace(/```json/gi, '').replace(/```/g, '').trim();
                    setQuiz(JSON.parse(jsonStr));
                }
            } catch (e) {
                console.error("Quiz Parse Error", e);
                setResultText(textRes.text); // Fallback to just text
            }
        } else {
            setError(textRes.text);
        }

        // Handle Image
        if (imageRes.success) {
            setImageUrl(imageRes.imageUrl);
        }

        setLoading(false);
    };

    const handleOptionSelect = (qIndex, optIndex) => {
        if (showScores) return; // Lock answers after submission
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header & Input */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <i className="fas fa-microscope text-indigo-500 mr-3"></i> Multi-Modal Research Canvas
                </h2>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Enter a complex topic (e.g., Quantum Computing, Photosynthesis)..."
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button variant="primary" onClick={handleGenerate} disabled={!topic || loading} className="px-6">
                        <i className="fas fa-search"></i>
                    </Button>
                </div>
            </div>

            {loading && <LoadingState message="Generating text, synthesizing images, & building quiz..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !resultText && !error && (
                <EmptyState icon="brain" title="Deep Dive Ready" description="Enter a topic to generate a text report, custom AI art, and a quiz." />
            )}

            {/* Results Grid */}
            {resultText && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Markdown Report */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-8 relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
                        <div className="absolute top-6 right-6 flex space-x-2">
                            <Button variant="secondary" onClick={() => copyToClipboard(resultText)} icon="copy" className="text-xs py-1 px-3">Copy</Button>
                        </div>
                        <MarkdownRenderer content={resultText} />
                    </div>

                    {/* Right Column: AI Image & Quiz */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Auto-Generated Concept Art */}
                        {imageUrl && (
                            <div className="glass-card rounded-2xl p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden group">
                                <div className="relative rounded-xl overflow-hidden">
                                    <img src={imageUrl} alt="AI Generated Concept" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <p className="text-white text-xs font-medium"><i className="fas fa-magic mr-1 text-indigo-400"></i> Auto-generated via Imagen 4.0</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interactive Gamified Quiz */}
                        {quiz && quiz.length > 0 && (
                            <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center text-slate-800 dark:text-white">
                                    <i className="fas fa-gamepad text-indigo-500 mr-2"></i> Knowledge Check
                                </h3>

                                {quiz.map((q, qIdx) => (
                                    <div key={qIdx} className="mb-5 last:mb-0">
                                        <p className="font-semibold mb-3 text-sm text-slate-700 dark:text-slate-200">{qIdx + 1}. {q.q}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIdx) => {
                                                const isSelected = selectedAnswers[qIdx] === oIdx;
                                                const isCorrect = showScores && q.answer === oIdx;
                                                const isWrong = showScores && isSelected && !isCorrect;

                                                let bgClass = "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300";

                                                if (isSelected) bgClass = "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300";
                                                if (isCorrect) bgClass = "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-300 shadow-sm";
                                                if (isWrong) bgClass = "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-300";

                                                return (
                                                    <div
                                                        key={oIdx}
                                                        onClick={() => handleOptionSelect(qIdx, oIdx)}
                                                        className={`p-3 rounded-xl border text-sm cursor-pointer transition-all duration-200 flex items-center ${bgClass}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border mr-3 flex-shrink-0 flex items-center justify-center ${isSelected || isCorrect || isWrong ? 'border-current' : 'border-slate-300 dark:border-slate-600'}`}>
                                                            {(isCorrect) && <div className="w-2 h-2 rounded-full bg-current"></div>}
                                                            {(isSelected && !showScores) && <div className="w-2 h-2 rounded-full bg-current"></div>}
                                                        </div>
                                                        {opt}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {!showScores ? (
                                    <Button
                                        onClick={() => setShowScores(true)}
                                        className="w-full mt-4"
                                        disabled={Object.keys(selectedAnswers).length < quiz.length}
                                    >
                                        Submit Answers
                                    </Button>
                                ) : (
                                    <div className="mt-6 text-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                        <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                            Score: {Object.keys(selectedAnswers).filter(k => quiz[k].answer === selectedAnswers[k]).length} / {quiz.length}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}