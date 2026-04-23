/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Ghost, Trophy } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "Neon Nights (Cyber AI Synth)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Grid Runner (AI Retrowave)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Digital Snake (Synthwave)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

const GRID_SIZE = 20;

type Point = { x: number; y: number };

export default function App() {
  // --- Audio State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);

  const directionRef = useRef(direction);

  // Sync direction ref to avoid dependency cycle in loop
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Audio Effects
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  // Keyboard controls for Game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game controls
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      
      const currentDir = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game Loop
  useEffect(() => {
    if (!isGameRunning || isGameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          // Generate new food
          let newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
          // Ensure food doesn't spawn on snake
          while (newSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) {
             newFood = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            };
          }
          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 120);
    return () => clearInterval(intervalId);
  }, [isGameRunning, isGameOver, food]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setIsGameOver(false);
    setIsGameRunning(true);
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    });
  };

  const playMusicIfNeeded = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative flex flex-col p-4 md:p-6 h-screen w-full mx-auto max-w-[1400px] static-noise">
      <div className="scanlines"></div>

      {/* Header */}
      <header className="flex justify-between items-end border-b-4 border-[#ff00ff] pb-2 md:pb-4 mb-4 shrink-0 px-2 relative z-10">
        <div className="flex flex-col">
           <h1 className="glitch text-2xl md:text-5xl font-mono text-[#00ffff] tracking-widest uppercase" data-text="SYS.SNAKE_PROTOCOL">
             SYS.SNAKE_PROTOCOL
           </h1>
           <p className="text-[#ff00ff] font-sans text-xs md:text-sm mt-2 opacity-80">v_2.0.4 // UNREGISTERED_INSTANCE</p>
        </div>
        <div className="flex flex-col items-end text-right font-sans uppercase">
           <span className="text-white/40 text-xs mb-1">SYSTEM_STATE</span>
           <span className={`text-md md:text-xl font-bold font-mono ${isGameOver ? "text-red-500 animate-pulse" : isGameRunning ? "text-[#00ffff]" : "text-[#ff00ff]"}`}>
             {isGameOver ? "FATAL_EXCEPTION" : isGameRunning ? "EXECUTING" : "AWAITING_CMD"}
           </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0 relative z-10">

        {/* Left Column: Buffers & I/O */}
        <section className="col-span-1 md:col-span-3 flex flex-col space-y-4 md:space-y-6 h-full font-sans">
          <div className="border-2 border-[#00ffff] bg-black p-4 flex flex-col min-h-0 flex-1 relative transform-gpu">
            <div className="absolute top-0 right-0 w-3 h-3 bg-[#00ffff]"></div>
            <h2 className="text-[#ff00ff] text-sm uppercase mb-4 border-b-2 border-dashed border-[#ff00ff] pb-2 tracking-widest font-mono">AUDIO_BUFFERS</h2>
            <div className="space-y-3 overflow-y-auto pr-2">
              {TRACKS.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => { setCurrentTrackIndex(i); setIsPlaying(true); }}
                  className={`p-2 transition-colors cursor-pointer border ${
                    currentTrackIndex === i
                      ? 'border-[#00ffff] bg-[#00ffff]/10 text-[#00ffff]'
                      : 'border-white/20 text-white/60 hover:text-[#ff00ff] hover:border-[#ff00ff]'
                  }`}
                >
                  <div className="text-sm truncate font-bold" title={track.title}>
                    {currentTrackIndex === i ? "> " : ""}{track.title}
                  </div>
                  <div className="text-[10px] opacity-60 mt-1">HEX: 0x{track.id.toString(16).toUpperCase().padStart(4, '0')}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-[#ff00ff] bg-black p-4 shrink-0 hidden md:block relative transform-gpu">
             <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#ff00ff]"></div>
            <h2 className="text-[#00ffff] text-sm uppercase mb-2 border-b-2 border-dashed border-[#00ffff] pb-2 tracking-widest font-mono">I/O_MAPPING</h2>
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-[150px] mx-auto text-[#00ffff] font-mono">
              <div className="col-start-2 w-10 h-10 border-2 border-white/30 flex items-center justify-center text-sm">W</div>
              <div className="col-start-1 row-start-2 w-10 h-10 border-2 border-white/30 flex items-center justify-center text-sm">A</div>
              <div className="col-start-2 row-start-2 w-10 h-10 border-2 border-[#ff00ff] bg-[#ff00ff]/20 text-[#ff00ff] flex items-center justify-center text-sm animate-pulse">S</div>
              <div className="col-start-3 row-start-2 w-10 h-10 border-2 border-white/30 flex items-center justify-center text-sm">D</div>
            </div>
          </div>
        </section>

        {/* Center Column: Render Target */}
        <section className="col-span-1 md:col-span-6 border-2 border-[#00ffff] bg-black relative flex flex-col overflow-hidden h-full min-h-[300px]">
          {/* Header block */}
          <div className="bg-[#00ffff] text-black font-sans text-xs md:text-sm p-2 flex justify-between items-center shrink-0 font-bold uppercase tracking-wider">
            <span>[PRC.RENDER_TARGET]</span>
            <span className="animate-pulse">0x0FFA21</span>
          </div>

          {/* Game Area */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#0A0A0A] p-2 md:p-4">
            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#00ffff]/20 pointer-events-none"></div>
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-[#00ffff]/20 pointer-events-none"></div>

            <div className="relative isolate z-10 w-full max-w-full aspect-square border border-[#ff00ff]/50 bg-black shadow-[inset_0_0_20px_rgba(255,0,255,0.2)]"
                 style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxHeight: '100%' }}>

              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);

                const isFood = food.x === x && food.y === y;
                const snakeIndex = snake.findIndex(seg => seg.x === x && seg.y === y);
                const isSnake = snakeIndex !== -1;
                const isHead = snakeIndex === 0;

                return (
                  <div key={i} className={`relative m-[1px] ${isFood || isSnake ? 'snake-cell' : ''} ${!isFood && !isSnake && (Math.random() > 0.995) ? 'bg-white/5 animate-pulse' : ''}`}>
                    {isFood && (
                      <div className="absolute inset-0 snake-food text-[8px] flex items-center justify-center text-white"><span className="animate-ping font-sans">x</span></div>
                    )}
                    {isSnake && (
                      <div className={`absolute inset-[1px] ${isHead ? 'snake-head z-10 shadow-[0_0_10px_#00ffff]' : 'snake-body'} bg-[#00ffff]`} />
                    )}
                  </div>
                );
              })}

              {!isGameRunning && !isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 font-sans text-center p-4 border-2 border-dashed border-[#00ffff] m-4">
                  <button
                    onClick={() => { startGame(); playMusicIfNeeded(); }}
                    className="px-6 py-3 border-2 border-[#ff00ff] bg-[#ff00ff]/10 hover:bg-[#ff00ff] text-[#ff00ff] hover:text-black font-bold text-xl md:text-2xl uppercase tracking-widest transition-all shadow-[0_0_15px_#ff00ff] glitch"
                    data-text="BEGIN_EXECUTION"
                  >
                    BEGIN_EXECUTION
                  </button>
                  <p className="mt-8 text-[#00ffff] text-sm md:text-base opacity-80 animate-pulse font-mono">WAITING_FOR_ROUTINE...</p>
                </div>
              )}

              {isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 z-20 font-sans text-center p-4 border-2 border-red-500 m-4">
                  <div className="glitch text-red-500 font-bold text-2xl md:text-4xl mb-4 text-shadow-[0_0_10px_red]" data-text="SYSTEM_FAILURE">SYSTEM_FAILURE</div>
                  <p className="text-red-300 mb-8 text-sm md:text-base font-bold">FRAGMENTS_LOST: {score}</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold text-lg uppercase tracking-widest transition-all shadow-[0_0_15px_red]"
                  >
                    RESTART_SEQUENCE
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Score & Frequency */}
        <section className="col-span-1 md:col-span-3 flex flex-col space-y-4 md:space-y-6 h-full font-sans">
          <div className="border-2 border-[#ff00ff] bg-black p-4 text-center shrink-0 relative">
             <div className="absolute top-0 right-0 w-3 h-3 bg-[#ff00ff]"></div>
            <div className="text-[#ff00ff] text-xs uppercase tracking-widest mb-2 border-b-2 border-dashed border-[#ff00ff] pb-1 font-mono">DATA_FRAGMENTS</div>
            <div className="text-4xl md:text-5xl font-mono text-[#00ffff] mt-4 filter drop-shadow-[0_0_10px_#00ffff]">
              {score.toString().padStart(4, '0')}
            </div>
          </div>

          <div className="border-2 border-[#00ffff] bg-black p-4 flex flex-col flex-1 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00ffff]"></div>
            <h2 className="text-[#00ffff] text-sm uppercase mb-4 border-b-2 border-dashed border-[#00ffff] pb-2 tracking-widest shrink-0 font-mono">FREQ_ANALYSIS</h2>
            <div className="flex-1 flex items-end justify-between px-1 pb-4 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((bar, i) => (
                <div
                  key={bar}
                  className={`flex-1 transition-all duration-75 ${i % 2 === 0 ? 'bg-[#00ffff]' : 'bg-[#ff00ff]'}`}
                  style={{
                     height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : `${[20, 50, 80, 60, 30, 90, 40, 70][i]}%`,
                     opacity: 0.8
                  }}
                />
              ))}
            </div>
            <div className="mt-auto text-left border-t-2 border-dashed border-[#00ffff]/50 pt-2 shrink-0 hidden sm:block">
              <div className="text-[10px] text-[#ff00ff] truncate font-bold">STREAM: {TRACKS[currentTrackIndex].title}</div>
              <div className="text-[10px] text-[#00ffff] mt-1 break-all uppercase line-through opacity-70">ENCRYPTION: DISABLED</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer: Transmission Interface */}
      <footer className="h-20 md:h-24 border-2 border-[#ff00ff] bg-black mt-4 flex items-center px-4 md:px-8 space-x-4 md:space-x-12 shrink-0 z-10 font-sans shadow-[0_0_20px_rgba(255,0,255,0.15)] relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#ff00ff]"></div>
        <audio
          ref={audioRef}
          src={TRACKS[currentTrackIndex].url}
          onEnded={nextTrack}
        />

        <div className="hidden md:block w-48 shrink-0">
           <div className="text-[#00ffff] text-xs uppercase animate-pulse font-mono tracking-widest">ACTIVE_STREAM</div>
           <div className="text-white text-sm truncate mt-1 font-bold">{TRACKS[currentTrackIndex].title}</div>
        </div>

        <div className="flex-1 flex flex-col space-y-3 max-w-2xl mx-auto">
          <div className="flex justify-center items-center space-x-6 md:space-x-8 font-mono">
            <button onClick={prevTrack} className="text-[#00ffff] hover:text-white transition-colors focus:outline-none uppercase text-xs md:text-sm tracking-widest">
              [REV]
            </button>
            <button
              onClick={togglePlay}
              className="px-6 py-2 border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black font-bold uppercase transition-colors focus:outline-none tracking-widest"
            >
              {isPlaying ? "HALT" : "PLAY"}
            </button>
            <button onClick={nextTrack} className="text-[#00ffff] hover:text-white transition-colors focus:outline-none uppercase text-xs md:text-sm tracking-widest">
              [FWD]
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full opacity-80 text-xs font-mono">
            <span className="text-[#ff00ff] w-8 text-right hidden lg:block">0x0</span>
            <div className="flex-1 h-[2px] bg-white/20 relative overflow-hidden">
              <div
                className={`h-full absolute left-0 top-0 transition-all duration-1000 ease-linear ${isPlaying ? 'w-[45%] bg-[#00ffff]' : 'w-0 bg-white/30'}`}
              ></div>
            </div>
            <span className="text-[#ff00ff] w-8 hidden lg:block">0xF</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-end w-48 shrink-0 text-xs font-mono">
          <button onClick={() => setIsMuted(!isMuted)} className="text-[#00ffff] uppercase hover:text-white transition-colors focus:outline-none mr-2">
            {isMuted ? "[MUTED]" : "[VOL: ON]"}
          </button>
          <div className="w-16 lg:w-20 h-2 border border-[#00ffff] p-[1px] relative">
            <div className="h-full bg-[#00ffff] transition-all duration-300" style={{ width: isMuted ? '0%' : '70%' }}></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
