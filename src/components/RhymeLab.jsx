import React, { useState, useEffect, useRef } from 'react';
import { Music, X, Tv, AlertTriangle, SkipBack, Pause, Play, ExternalLink, Lightbulb } from 'lucide-react';
import '../styles/dyslexia-backdrop.css';

export const RhymeLab = ({ onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playerStatus, setPlayerStatus] = useState('loading'); // 'loading' | 'ready' | 'playing' | 'error'
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    // Video ID: LooLoo Kids - Johny Johny Yes Papa
    const videoId = 'F4tHL8reNCs';

    useEffect(() => {
        let isMounted = true;

        // 1. Ensure Global Callback exists
        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube API Ready");
            if (isMounted) initPlayer();
        };

        // 2. Load Script if not present
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        } else if (window.YT.Player) {
            // Already loaded, just init
            initPlayer();
        }

        const initPlayer = () => {
            if (!containerRef.current || playerRef.current) return;

            console.log("Initializing Player...");
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0, // HIDE built-in YouTube controls
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    fs: 0, // Disable fullscreen from built-in controls
                    disablekb: 1, // Disable keyboard controls
                    iv_load_policy: 3, // Hide video annotations
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        console.log("Player Ready");
                        if (isMounted) {
                            setPlayerStatus('ready');
                            event.target.playVideo();
                        }
                    },
                    onStateChange: (event) => {
                        if (!isMounted) return;
                        if (event.data === 1) { // PLAYING
                            setPlayerStatus('playing');
                            setIsPlaying(true);
                        } else {
                            setPlayerStatus('ready');
                            setIsPlaying(false);
                        }
                    },
                    onError: (err) => {
                        console.error("Player Error:", err);
                        if (isMounted) setPlayerStatus('error');
                    }
                }
            });
        };

        // Fallback check: if API loaded but callback didn't fire
        const fallback = setTimeout(() => {
            if (window.YT && window.YT.Player && !playerRef.current) {
                initPlayer();
            }
        }, 2000);

        return () => {
            isMounted = false;
            clearTimeout(fallback);
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
            playerRef.current = null;
        };
    }, []);

    return (
        <div className="game-overlay animate-fade-in" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 10
            }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Music size={32}/> Johny Johny Yes Papa</h2>
                <button onClick={onClose} className="btn-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><X size={36}/></button>
            </div>

            {/* Main Stage */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',
                padding: '20px'
            }}>

                {/* Status Messages */}
                {playerStatus === 'loading' && (
                    <div style={{ color: 'white', fontSize: '1.8rem', textAlign: 'center' }}>
                        <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Tv size={28}/> Connecting to YouTube...</div>
                        <p style={{ fontSize: '1rem', opacity: 0.6 }}>Please wait a moment</p>
                    </div>
                )}

                {playerStatus === 'error' && (
                    <div style={{ color: '#f87171', fontSize: '1.5rem', textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '20px' }}>
                        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><AlertTriangle size={24}/> Oops! The video couldn't load.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-secondary"
                            style={{ marginTop: '10px' }}
                        >Refresh Page</button>
                    </div>
                )}

                {/* Player Container */}
                <div style={{
                    width: '90%',
                    maxWidth: '1000px',
                    aspectRatio: '16/9',
                    borderRadius: '30px',
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
                    border: '8px solid rgba(255,255,255,0.05)',
                    background: '#000',
                    display: playerStatus === 'error' ? 'none' : 'block'
                }}>
                    <div ref={containerRef}></div>
                </div>
            </div>

            {/* Footer / Custom Controls */}
            <div style={{
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                background: 'rgba(0,0,0,0.6)',
                borderTop: '2px solid rgba(255,255,255,0.1)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <button
                        onClick={() => playerRef.current?.seekTo(0)}
                        className="btn-control"
                        style={{
                            background: '#475569',
                            color: 'white',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '50px',
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                        }}
                    >
                        <span><SkipBack size={24}/></span> Restart
                    </button>

                    <button
                        onClick={() => {
                            if (isPlaying) playerRef.current?.pauseVideo();
                            else playerRef.current?.playVideo();
                        }}
                        style={{
                            background: isPlaying ? '#ef4444' : '#22c55e',
                            color: 'white',
                            border: 'none',
                            padding: '20px 60px',
                            borderRadius: '100px',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                            transition: 'all 0.2s',
                            transform: 'scale(1.1)'
                        }}
                    >
                        {isPlaying ? (
                            <><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pause size={36}/></span> Pause</>
                        ) : (
                            <><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={36}/></span> Play</>
                        )}
                    </button>

                    <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: 'var(--primary-cyan)',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            opacity: 0.8,
                            padding: '15px'
                        }}
                    >
                        Open YouTube <ExternalLink size={16} style={{ marginLeft: '4px' }}/>
                    </a>
                </div>

                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Lightbulb size={20}/> Use our special big buttons to control the song!
                </p>
            </div>

            <style>{`
                .btn-control:hover { transform: translateY(-2px); opacity: 0.9; }
                .btn-control:active { transform: translateY(0); }
                #rhyme-video-player-container { pointer-events: none; }
            `}</style>
        </div>
    );
};
