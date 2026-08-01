import { Button } from '../components/UI';

export default function LandingPage({ startExploring }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]"></div>
            
            <div className="z-10 animate-float max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
                    One AI. <br className="md:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Every Student Need.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto font-light">
                    Your Personal AI Operating System for College.
                </p>
                <Button onClick={startExploring} className="px-8 py-4 text-lg rounded-full w-full sm:w-auto" icon="rocket">
                    Start Exploring Free
                </Button>
            </div>
        </div>
    );
}