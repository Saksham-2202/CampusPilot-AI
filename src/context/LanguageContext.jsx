import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
    { code: 'English', label: 'English' },
    { code: 'Hindi', label: 'Hindi' },
    { code: 'Tamil', label: 'Tamil' },
    { code: 'Telugu', label: 'Telugu' },
    { code: 'Bengali', label: 'Bengali' },
    { code: 'Marathi', label: 'Marathi' },
    { code: 'Kannada', label: 'Kannada' },
    { code: 'Punjabi', label: 'Punjabi' },
    { code: 'Gujarati', label: 'Gujarati' },
    { code: 'Malayalam', label: 'Malayalam' },
];

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('campuspilot_language') || 'English';
    });

    useEffect(() => {
        localStorage.setItem('campuspilot_language', language);
    }, [language]);

    const getLanguageInstruction = () => {
        if (language === 'English') return '';
        return `\n\nIMPORTANT LANGUAGE INSTRUCTION: Respond entirely in ${language}. Every heading, label, explanation, and piece of content in your output must be written in natural, fluent ${language} - the way a native speaker would write it - not English. Keep code snippets, mathematical notation, and proper nouns as-is where translating them would be incorrect or confusing.`;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, getLanguageInstruction }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
    return ctx;
}