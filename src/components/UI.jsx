import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon = null }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none";
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md",
        secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700",
        ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
    };
    const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5";
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {icon && <i className={`fas fa-${icon} ${children ? 'mr-2' : ''}`}></i>}
            {children}
        </button>
    );
};

export const MarkdownRenderer = ({ content }) => {
    const renderRef = useRef(null);
    useEffect(() => {
        if (renderRef.current) {
            // Ensure marked parses line breaks and lists properly
            marked.setOptions({ breaks: true, gfm: true });
            renderRef.current.innerHTML = marked.parse(content);
            
            // Re-run prism highlighting if code blocks are present
            if (window.Prism) {
                window.Prism.highlightAllUnder(renderRef.current);
            }
        }
    }, [content]);
    
    // We apply 'markdown-body' which ties into the robust CSS we just added
    return (
        <div 
            ref={renderRef} 
            className="markdown-body text-slate-800 dark:text-slate-200 w-full"
            style={{ padding: '1rem 0' }}
        ></div>
    );
};

export const LoadingState = ({ message = "AI is thinking..." }) => (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 bg-indigo-500 rounded-full typing-dot"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full typing-dot"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full typing-dot"></div>
        </div>
        <p className="font-medium animate-pulse">{message}</p>
    </div>
);

export const EmptyState = ({ icon, title, description }) => (
    <div className="flex flex-col items-center justify-center p-16 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
        <div className="w-20 h-20 mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 text-3xl shadow-inner">
            <i className={`fas fa-${icon}`}></i>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
        <p className="max-w-md text-sm">{description}</p>
    </div>
);

export const ErrorState = ({ message, onRetry }) => (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-4">
        <div className="text-red-500 mt-1"><i className="fas fa-exclamation-circle text-xl"></i></div>
        <div className="flex-1">
            <h4 className="text-red-800 dark:text-red-300 font-semibold mb-1">Something went wrong</h4>
            <p className="text-red-600 dark:text-red-400 text-sm mb-3">{message}</p>
            <Button variant="secondary" onClick={onRetry} className="text-sm border-red-200">Try Again</Button>
        </div>
    </div>
);