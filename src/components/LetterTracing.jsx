import React, { useRef, useEffect, useState } from 'react';
import { X, PenTool, Trash2, Volume2 } from 'lucide-react';
import '../styles/style-kids.css';

export const LetterTracing = ({ letter, onClose }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set high resolution
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 15;

        drawTemplate(ctx, rect.width, rect.height);
    }, [letter]);

    const drawTemplate = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);
        ctx.font = 'bold 300px Arial';
        ctx.fillStyle = 'rgba(124, 58, 237, 0.1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.toUpperCase(), width / 2, height / 2);
    };

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoords(e);
        const ctx = canvasRef.current.getContext('2d');

        // Rainbow Gradient
        const gradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, 0);
        gradient.addColorStop('0', '#ff5f6d');
        gradient.addColorStop('1', '#ffc371');

        ctx.strokeStyle = gradient;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        drawTemplate(ctx, rect.width, rect.height);
    };

    return (
        <div className="game-overlay animate-fade-in">
            <div className="card game-modal" style={{ maxWidth: '900px', width: '90%', textAlign: 'center', padding: '20px' }}>
                <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24}/></button>

                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><PenTool size={28}/> Trace Letter {letter}</h2>

                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                        width: '100%',
                        height: '400px',
                        background: 'white',
                        borderRadius: 'var(--radius-xl)',
                        boxShadow: 'var(--shadow-inner)',
                        cursor: 'crosshair',
                        touchAction: 'none'
                    }}
                />

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                    <button onClick={clearCanvas} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={20}/> Clear</button>
                    <button onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(letter);
                        window.speechSynthesis.speak(utterance);
                    }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Volume2 size={20}/> Hear Letter</button>
                </div>
            </div>
        </div>
    );
};
