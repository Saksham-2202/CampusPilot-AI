// src/tools/MindMap.jsx
import { useState, useRef, useCallback } from 'react';
import { callGeminiJSON } from '../lib/gemini';
import { Button, LoadingState, EmptyState, ErrorState } from '../components/UI';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function MindMap() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [nodes, setNodes] = useState(null);
    const [error, setError] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const { getLanguageInstruction } = useLanguage();

    const svgRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const VIEW_W = 1000;
    const VIEW_H = 640;
    const CX = VIEW_W / 2;
    const CY = VIEW_H / 2;

    const buildLayout = (data) => {
        const built = [];
        built.push({ id: 'root', label: data.central, type: 'central', x: CX, y: CY, parentId: null, color: '#4f46e5' });

        const branches = data.branches || [];
        const R1 = 220;
        const R2 = 130;

        branches.forEach((branch, bIdx) => {
            const angle = (2 * Math.PI * bIdx / branches.length) - Math.PI / 2;
            const bx = CX + R1 * Math.cos(angle);
            const by = CY + R1 * Math.sin(angle);
            const color = COLORS[bIdx % COLORS.length];
            const branchId = `b${bIdx}`;

            built.push({ id: branchId, label: branch.title, type: 'branch', x: bx, y: by, parentId: 'root', color });

            const children = branch.children || [];
            const spread = Math.PI / 3.2;
            children.forEach((child, cIdx) => {
                const childAngle = angle - spread / 2 + (spread * cIdx / Math.max(children.length - 1, 1));
                const cx = bx + R2 * Math.cos(childAngle);
                const cy = by + R2 * Math.sin(childAngle);
                built.push({ id: `${branchId}c${cIdx}`, label: child, type: 'child', x: cx, y: cy, parentId: branchId, color });
            });
        });

        return built;
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true); setError(null); setNodes(null);

        const sysPrompt = `You are an expert curriculum designer creating a mind map. Return ONLY valid JSON, no markdown, no code fences, matching exactly this schema:
{"central": "string (the topic, max 4 words)", "branches": [{"title": "string (max 4 words)", "children": ["string (max 5 words)", "string (max 5 words)", "string (max 5 words)"]}]}
Generate exactly 6 branches, each with exactly 3 children. Keep every label short and scannable — these are diagram labels, not sentences.`+ getLanguageInstruction();

        const res = await callGeminiJSON(`Topic: ${topic}`, sysPrompt);

        if (res.success && res.data?.central && Array.isArray(res.data?.branches)) {
            setNodes(buildLayout(res.data));
        } else {
            setError(res.text || "Couldn't build a map from that topic. Try rephrasing it.");
        }
        setLoading(false);
    };

    const getSvgPoint = (clientX, clientY) => {
        const svg = svgRef.current;
        const rect = svg.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * VIEW_W;
        const y = ((clientY - rect.top) / rect.height) * VIEW_H;
        return { x, y };
    };

    const handlePointerDown = (e, node) => {
        if (node.type === 'central') return;
        e.stopPropagation();
        const point = getSvgPoint(e.clientX, e.clientY);
        dragOffset.current = { x: point.x - node.x, y: point.y - node.y };
        setDraggingId(node.id);
    };

    const handlePointerMove = useCallback((e) => {
        if (!draggingId) return;
        const point = getSvgPoint(e.clientX, e.clientY);
        setNodes(prev => prev.map(n =>
            n.id === draggingId
                ? { ...n, x: point.x - dragOffset.current.x, y: point.y - dragOffset.current.y }
                : n
        ));
    }, [draggingId]);

    const handlePointerUp = useCallback(() => setDraggingId(null), []);

    const findNode = (id) => nodes?.find(n => n.id === id);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center"><i className="fas fa-project-diagram text-indigo-500 mr-3"></i>Mind Map Generator</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Type any topic — get a live, draggable concept map instead of a wall of text.</p>

                <div className="flex space-x-2">
                    <input
                        type="text"
                        className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                        placeholder="Enter a topic (e.g., Operating Systems, French Revolution)..."
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button variant="primary" onClick={handleGenerate} disabled={!topic || loading} icon="magic">
                        Map It
                    </Button>
                </div>
            </div>

            {loading && <LoadingState message="Mapping out the concept tree..." />}
            {error && <ErrorState message={error} onRetry={handleGenerate} />}
            {!loading && !nodes && !error && (
                <EmptyState icon="sitemap" title="Visualize Any Topic" description="Type a topic to generate an interactive mind map you can drag and rearrange." />
            )}

            {nodes && (
                <div className="glass-card rounded-2xl p-2 overflow-hidden">
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                        className="w-full h-auto select-none touch-none"
                        style={{ minHeight: '480px' }}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    >
                        {nodes.filter(n => n.parentId).map(n => {
                            const parent = findNode(n.parentId);
                            if (!parent) return null;
                            return (
                                <line
                                    key={`edge-${n.id}`}
                                    x1={parent.x} y1={parent.y} x2={n.x} y2={n.y}
                                    stroke={n.color} strokeOpacity="0.35" strokeWidth={n.type === 'branch' ? 2.5 : 1.5}
                                />
                            );
                        })}

                        {nodes.map(n => {
                            const isCentral = n.type === 'central';
                            const isBranch = n.type === 'branch';
                            const r = isCentral ? 56 : isBranch ? 40 : 30;
                            const fontSize = isCentral ? 15 : isBranch ? 12 : 10.5;

                            return (
                                <g
                                    key={n.id}
                                    transform={`translate(${n.x}, ${n.y})`}
                                    onPointerDown={(e) => handlePointerDown(e, n)}
                                    style={{ cursor: isCentral ? 'default' : 'grab' }}
                                >
                                    <circle
                                        r={r}
                                        fill={isCentral ? n.color : 'white'}
                                        stroke={n.color}
                                        strokeWidth={isCentral ? 0 : 2.5}
                                        className="dark:fill-slate-800"
                                        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
                                    />
                                    <foreignObject x={-r + 6} y={-r + 6} width={(r - 6) * 2} height={(r - 6) * 2}>
                                        <div
                                            className={`w-full h-full flex items-center justify-center text-center font-semibold leading-tight px-1 ${isCentral ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}
                                            style={{ fontSize: `${fontSize}px` }}
                                        >
                                            {n.label}
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>
                    <p className="text-center text-xs text-slate-400 mt-2 pb-2">Drag any node to rearrange the map</p>
                </div>
            )}
        </div>
    );
}