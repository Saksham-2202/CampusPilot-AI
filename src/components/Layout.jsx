// src/components/Layout.jsx
import { useState } from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export const Sidebar = ({ toolsList, currentTool, setCurrentTool, setCurrentView, currentView, isMobileOpen, setIsMobileOpen }) => (
    <>
        {isMobileOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
        )}
        <aside className={`fixed lg:static inset-y-0 left-0 w-72 glass-panel border-r border-slate-200 dark:border-slate-800 z-50 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col h-screen`}>
            <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setCurrentView('landing')}>
                <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
                    <i className="fas fa-graduation-cap text-3xl"></i>
                    <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">CampusPilot</span>
                </div>
                <button className="lg:hidden text-slate-500" onClick={() => setIsMobileOpen(false)}><i className="fas fa-times text-xl"></i></button>
            </div>

            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Tools</div>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {toolsList.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => { setCurrentTool(tool.id); setCurrentView('dashboard'); setIsMobileOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentTool === tool.id && currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                    >
                        <i className={`fas fa-${tool.icon} w-5 text-center ${currentTool === tool.id && currentView === 'dashboard' ? 'text-white' : 'text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform'}`}></i>
                        <div className="text-left">
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className={`text-xs ${currentTool === tool.id && currentView === 'dashboard' ? 'text-indigo-200' : 'text-slate-400'}`}>{tool.desc}</div>
                        </div>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => { setCurrentView('settings'); setIsMobileOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'settings' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                >
                    <i className="fas fa-cog w-5 text-center text-slate-500"></i>
                    <span className="font-medium text-sm">Settings</span>
                </button>
            </div>
        </aside>
    </>
);

export const Topbar = ({ toggleTheme, theme, setIsMobileOpen }) => {
    const { language, setLanguage } = useLanguage();
    const [langOpen, setLangOpen] = useState(false);
    const currentLabel = LANGUAGES.find(l => l.code === language)?.label || 'English';

    return (
        <header className="h-20 glass-panel border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center space-x-4">
                <button className="lg:hidden text-slate-600 dark:text-slate-300" onClick={() => setIsMobileOpen(true)}>
                    <i className="fas fa-bars text-xl"></i>
                </button>
                <div className="relative hidden md:block">
                    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    <input type="text" placeholder="Search anything (Cmd+K)" className="pl-10 pr-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm" />
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <button
                        onClick={() => setLangOpen(o => !o)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                        <i className="fas fa-globe text-indigo-500"></i>
                        <span className="hidden sm:inline">{currentLabel}</span>
                        <i className="fas fa-chevron-down text-xs opacity-50"></i>
                    </button>
                    {langOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-700">
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${language === l.code ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        {l.label}
                                        {language === l.code && <i className="fas fa-check float-right mt-0.5"></i>}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <i className={`fas ${theme === 'dark' ? 'fa-sun text-yellow-400' : 'fa-moon text-slate-600'} text-lg`}></i>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 cursor-pointer shadow-md transform hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent" alt="Profile" className="w-8 h-8" />
                    </div>
                </div>
            </div>
        </header>
    );
};