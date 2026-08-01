
import { Button } from '../components/UI';

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn p-6">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Settings</h2>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden p-6 space-y-6">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-2">About CampusPilot AI</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Version 2.0.0. Powered by Gemini.</p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="secondary" icon="comment-alt">Send Feedback</Button>
                </div>
            </div>
        </div>
    );
}