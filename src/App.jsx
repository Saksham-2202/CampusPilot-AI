import  { useState, useEffect, useMemo } from 'react';
import { Sidebar, Topbar } from './components/Layout';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';

// Import ALL 8 Tools
import StudyAssistant from './tools/StudyAssistant';
import CodingAssistant from './tools/CodingAssistant';
import ResumeAssistant from './tools/ResumeAssistant';
import EmailGenerator from './tools/EmailGenerator';
import StudyPlanner from './tools/StudyPlanner';
import PresentationGenerator from './tools/PresentationGenerator';
import InterviewCoach from './tools/InterviewCoach';
import ResearchAssistant from './tools/ResearchAssistant';
import SnapSolve from './tools/SnapSolve';
import TalkAndLearn from './tools/TalkAndLearn';
import MindMap from './tools/MindMap';
import { useLanguage } from './context/LanguageContext';

const toolsList = [
    { id: 'study', name: 'Study Assistant', icon: 'book', component: StudyAssistant, desc: 'Summaries & Flashcards' },
    { id: 'coding', name: 'Coding Assistant', icon: 'laptop-code', component: CodingAssistant, desc: 'Debug & Optimize' },
    { id: 'resume', name: 'Resume Assistant', icon: 'file-alt', component: ResumeAssistant, desc: 'ATS Check & Polish' },
    { id: 'email', name: 'Email Generator', icon: 'envelope', component: EmailGenerator, desc: 'Professional Drafts' },
    { id: 'planner', name: 'Study Planner', icon: 'calendar-alt', component: StudyPlanner, desc: 'Timetables & Strategy' },
    { id: 'presentation', name: 'Presentation', icon: 'desktop', component: PresentationGenerator, desc: 'Outlines & Notes' },
    { id: 'interview', name: 'Interview Coach', icon: 'user-tie', component: InterviewCoach, desc: 'Mock Q&A Feedback' },
    { id: 'research', name: 'Research Assistant', icon: 'microscope', component: ResearchAssistant, desc: 'Deep Dives & Ideas' },
    { id: 'snapsolve', name: 'Snap & Solve', icon: 'camera', component: SnapSolve, desc: 'Photo → Instant Breakdown' },
    { id: 'talklearn', name: 'Talk & Learn', icon: 'microphone-alt', component: TalkAndLearn, desc: 'Voice → Instant Notes' },
    { id: 'mindmap', name: 'Mind Map', icon: 'project-diagram', component: MindMap, desc: 'Live Visual Concept Maps' },
];

export default function App() {
    const [currentView, setCurrentView] = useState('landing');
    const [currentTool, setCurrentTool] = useState('study');
    const [theme, setTheme] = useState('dark');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
        else setTheme('light');
    }, []);

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    const ActiveToolComponent = useMemo(() => {
        const tool = toolsList.find(t => t.id === currentTool);
        return tool ? tool.component : StudyAssistant;
    }, [currentTool]);

    const bgClass = theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50';

    if (currentView === 'landing') {
        return <div className={`min-h-screen ${bgClass} transition-colors duration-500`}><LandingPage startExploring={() => setCurrentView('dashboard')} /></div>;
    }

    return (
        <div className={`flex h-screen overflow-hidden ${bgClass} transition-colors duration-500`}>
            <Sidebar toolsList={toolsList} currentTool={currentTool} setCurrentTool={setCurrentTool} setCurrentView={setCurrentView} currentView={currentView} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Topbar toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} theme={theme} setIsMobileOpen={setIsMobileOpen} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto h-full">
                        {currentView === 'settings' ? <SettingsPage /> : <ActiveToolComponent />}
                    </div>
                </main>
            </div>
        </div>
    );
}