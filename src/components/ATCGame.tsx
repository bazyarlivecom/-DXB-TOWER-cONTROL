import React, { useEffect, useRef, useState } from "react";
import { Plane, GameState } from "../types";
import { updateGame, spawnPlane, PATTERN } from "../game/engine";
import ControlPanel from "./ControlPanel";

export default function ATCGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [trafficRate, setTrafficRate] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>({
    planes: [],
    score: 0,
    gameOver: false,
    message: "",
    spawnTimer: 2,
  });
  const [selectedPlaneId, setSelectedPlaneId] = useState<string | null>(null);
  const selectedPlaneIdRef = useRef(selectedPlaneId);
  selectedPlaneIdRef.current = selectedPlaneId;

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{x: number, y: number}>({x: 0, y: 0});
  const drawingPlaneIdRef = useRef<string | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{x: number, y: number} | null>(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const gameSpeedRef = useRef(gameSpeed);
  gameSpeedRef.current = gameSpeed;

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const trafficRateRef = useRef(trafficRate);
  trafficRateRef.current = trafficRate;

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const panRef = useRef(pan);
  panRef.current = pan;

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const dt = ((time - lastTimeRef.current) / 1000) * gameSpeedRef.current;
      lastTimeRef.current = time;

      if (!gameStateRef.current.gameOver && dt > 0) {
        const newState = updateGame(gameStateRef.current, dt, trafficRateRef.current);
        setGameState(newState);
      }

      draw(gameStateRef.current);
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPlaneId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const draw = (state: GameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 + panRef.current.x, canvas.height / 2 + panRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let r = 100; r <= 400; r += 100) {
      ctx.beginPath();
      ctx.arc(400, 400, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 800);
    ctx.moveTo(0, 400);
    ctx.lineTo(800, 400);
    ctx.stroke();

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Runway 12/30 (Single runway at 400,400)
    ctx.moveTo(400 - 20, 400 - 11.5);
    ctx.lineTo(400 + 20, 400 + 11.5);
    ctx.stroke();

    // Draw ILS Cones for both ends
    const drawILSCone = (x: number, y: number, heading: number, color: string) => {
      const mathAngle = (heading - 90 + 180) * Math.PI / 180;
      const spread = 8 * Math.PI / 180;
      const dist = 500;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(mathAngle - spread) * dist, y + Math.sin(mathAngle - spread) * dist);
      ctx.lineTo(x + Math.cos(mathAngle + spread) * dist, y + Math.sin(mathAngle + spread) * dist);
      ctx.closePath();
      ctx.fill();
      
      // Centerline
      ctx.strokeStyle = color.replace("0.05", "0.2");
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(mathAngle) * dist, y + Math.sin(mathAngle) * dist);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawILSCone(400, 400, 120, "rgba(16, 185, 129, 0.05)"); // Approach to RW12
    // Removed RW30 cone for single direction landing

    // Draw RW12 patterns (Multiple Downwind Paths)
    const drawPattern = (points: any[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    };

    // Inner Downwind
    drawPattern([
      PATTERN.RW12.DW_I5, PATTERN.RW12.DW_I4, PATTERN.RW12.DW_I3, PATTERN.RW12.DW_I2, PATTERN.RW12.DW_I1,
      PATTERN.RW12.ENTRY, PATTERN.RW12.IAF, PATTERN.RW12.FAF, PATTERN.RW12.FINAL
    ], "rgba(16, 185, 129, 0.4)");

    // Outer Downwind
    drawPattern([
      PATTERN.RW12.DW_O5, PATTERN.RW12.DW_O4, PATTERN.RW12.DW_O3, PATTERN.RW12.DW_O2, PATTERN.RW12.DW_O1,
      PATTERN.RW12.ENTRY
    ], "rgba(16, 185, 129, 0.2)");

    // Extended Downwind
    drawPattern([
      PATTERN.RW12.DW_E5, PATTERN.RW12.DW_E4, PATTERN.RW12.DW_E3, PATTERN.RW12.DW_E2, PATTERN.RW12.DW_E1,
      PATTERN.RW12.ENTRY
    ], "rgba(16, 185, 129, 0.1)");

    ctx.setLineDash([]);

    // Draw Holding Points
    ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
    ctx.setLineDash([2, 2]);
    Object.values(PATTERN.HOLD).forEach(hold => {
      ctx.beginPath();
      ctx.arc(hold.x, hold.y, 20, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const waypoints = [
      { x: PATTERN.RW12.FINAL.x, y: PATTERN.RW12.FINAL.y, label: 'FINAL' },
      { x: PATTERN.RW12.FAF.x, y: PATTERN.RW12.FAF.y, label: 'FAF' },
      { x: PATTERN.RW12.IAF.x, y: PATTERN.RW12.IAF.y, label: 'IAF' },
      { x: PATTERN.RW12.ENTRY.x, y: PATTERN.RW12.ENTRY.y, label: 'ENTRY' },
      { x: PATTERN.RW12.DW_I5.x, y: PATTERN.RW12.DW_I5.y, label: 'DW-I' },
      { x: PATTERN.RW12.DW_O5.x, y: PATTERN.RW12.DW_O5.y, label: 'DW-O' },
      { x: PATTERN.RW12.DW_E5.x, y: PATTERN.RW12.DW_E5.y, label: 'DW-E' },
      { x: PATTERN.HOLD.NW.x, y: PATTERN.HOLD.NW.y, label: 'HOLD-NW' },
      { x: PATTERN.HOLD.NE.x, y: PATTERN.HOLD.NE.y, label: 'HOLD-NE' },
      { x: PATTERN.HOLD.SW.x, y: PATTERN.HOLD.SW.y, label: 'HOLD-SW' },
      { x: PATTERN.HOLD.SE.x, y: PATTERN.HOLD.SE.y, label: 'HOLD-SE' },
      { x: PATTERN.HOLD.CENTER_N.x, y: PATTERN.HOLD.CENTER_N.y, label: 'HOLD-CN' },
      { x: PATTERN.HOLD.CENTER_S.x, y: PATTERN.HOLD.CENTER_S.y, label: 'HOLD-CS' },
    ];

    waypoints.forEach(wp => {
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.moveTo(wp.x, wp.y - 6);
      ctx.lineTo(wp.x + 6, wp.y + 4);
      ctx.lineTo(wp.x - 6, wp.y + 4);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px sans-serif';
      ctx.fillText(wp.label, wp.x + 10, wp.y + 4);
    });

    // Helper to get color based on altitude (0 to 15000)
    const getAltitudeColor = (altitude: number, alpha: number = 1) => {
      if (altitude > 10000) return `rgba(56, 189, 248, ${alpha})`; // Sky blue
      if (altitude > 5000) return `rgba(52, 211, 153, ${alpha})`; // Emerald
      if (altitude > 2000) return `rgba(250, 204, 21, ${alpha})`; // Yellow
      return `rgba(249, 115, 22, ${alpha})`; // Orange
    };

    const getSpeedColor = (speed: number, alpha: number = 1) => {
      if (speed < 180) return `rgba(239, 68, 68, ${alpha})`; // Red
      if (speed < 220) return `rgba(249, 115, 22, ${alpha})`; // Orange
      if (speed < 280) return `rgba(234, 179, 8, ${alpha})`; // Yellow
      if (speed < 320) return `rgba(34, 197, 94, ${alpha})`; // Green
      return `rgba(6, 182, 212, ${alpha})`; // Cyan
    };

    state.planes.forEach((p) => {
      if (p.status === "escaped") return;

      const isSelected = p.id === selectedPlaneIdRef.current;
      const baseColor = p.warning ? "#ef4444" : getAltitudeColor(p.altitude);

      // Draw multi-colored trail based on speed at each point
      if (p.trail.length > 1) {
        ctx.lineWidth = 2;
        for (let i = 0; i < p.trail.length - 1; i++) {
          const p1 = p.trail[i];
          const p2 = p.trail[i + 1];
          ctx.strokeStyle = getSpeedColor(p1.speed, 0.6);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        // Connect last trail point to current position
        const lastTrail = p.trail[p.trail.length - 1];
        ctx.strokeStyle = getSpeedColor(p.speed, 0.6);
        ctx.beginPath();
        ctx.moveTo(lastTrail.x, lastTrail.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      if (p.waypoints && p.waypoints.length > 0) {
        ctx.strokeStyle = isSelected ? baseColor : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        for (let i = 0; i < p.waypoints.length; i++) {
          ctx.lineTo(p.waypoints[i].x, p.waypoints[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw endpoint
        const lastWp = p.waypoints[p.waypoints.length - 1];
        ctx.fillStyle = isSelected ? baseColor : "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(lastWp.x, lastWp.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.heading * Math.PI) / 180);

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Plane SVG path (FlightRadar24 style silhouette)
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      // Fuselage
      ctx.ellipse(0, 0, 3, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Wings
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(14, 4);
      ctx.lineTo(14, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-14, 6);
      ctx.lineTo(-14, 4);
      ctx.closePath();
      ctx.fill();
      
      // Tail
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(6, 11);
      ctx.lineTo(6, 12);
      ctx.lineTo(0, 10);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-6, 11);
      ctx.closePath();
      ctx.fill();
      
      // Nose
      ctx.beginPath();
      ctx.arc(0, -11, 3, Math.PI, 0);
      ctx.fill();

      if (p.warning) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();

      ctx.fillStyle = isSelected ? "#fff" : "#94a3b8";
      ctx.font = isSelected ? "bold 11px monospace" : "10px monospace";
      ctx.fillText(p.callsign, p.x + 12, p.y - 12);
      
      ctx.fillStyle = getAltitudeColor(p.altitude);
      ctx.fillText(
        `${Math.round(p.altitude / 100)}  ${Math.round(p.speed / 10)} ${p.ilsEnabled ? 'ILS' : ''}`,
        p.x + 12,
        p.y + 2,
      );
    });

    ctx.restore();
  };

  const getWorldCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    // Reverse the transform:
    // 1. translate back to center
    // 2. unscale
    // 3. untranslate pan
    const x = (screenX - canvas.width / 2 - panRef.current.x) / zoomRef.current + canvas.width / 2;
    const y = (screenY - canvas.height / 2 - panRef.current.y) / zoomRef.current + canvas.height / 2;
    
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getWorldCoords(e);
    
    // Right click or middle click for panning
    if (e.button === 2 || e.button === 1) {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const clicked = gameState.planes.find(
      (p) => Math.hypot(p.x - x, p.y - y) < 25 / zoomRef.current,
    );
    if (clicked) {
      setSelectedPlaneId(clicked.id);
      drawingPlaneIdRef.current = clicked.id;
      isDraggingRef.current = false;
    } else if (selectedPlaneId) {
      const plane = gameState.planes.find(p => p.id === selectedPlaneId);
      if (plane) {
        handleCommand(plane.id, { waypoints: [{x, y}] });
      }
    } else {
      setSelectedPlaneId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current && lastMousePosRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!drawingPlaneIdRef.current) return;
    
    const { x, y } = getWorldCoords(e);

    setGameState((prev) => {
      const newState = { ...prev, planes: [...prev.planes] };
      const planeIndex = newState.planes.findIndex(p => p.id === drawingPlaneIdRef.current);
      if (planeIndex !== -1) {
        const plane = { ...newState.planes[planeIndex] };
        
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          plane.waypoints = [];
        }

        const lastWp = plane.waypoints && plane.waypoints.length > 0 
          ? plane.waypoints[plane.waypoints.length - 1] 
          : { x: plane.x, y: plane.y };
          
        // Smaller distance threshold for smoother drawing
        if (Math.hypot(lastWp.x - x, lastWp.y - y) > 10) {
          plane.waypoints = [...(plane.waypoints || []), { x, y }];
          newState.planes[planeIndex] = plane;
        }
      }
      return newState;
    });
  };

  const handleMouseUp = () => {
    drawingPlaneIdRef.current = null;
    isDraggingRef.current = false;
    isPanningRef.current = false;
    lastMousePosRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + zoomFactor, 3));
    } else {
      setZoom(prev => Math.max(prev - zoomFactor, 0.5));
    }
  };

  const selectedPlane = gameState.planes.find((p) => p.id === selectedPlaneId);

  const handleCommand = (id: string, updates: Partial<Plane>) => {
    setGameState((prev) => ({
      ...prev,
      planes: prev.planes.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const removePlane = (id: string) => {
    setGameState(prev => ({
      ...prev,
      planes: prev.planes.filter(p => p.id !== id)
    }));
    setSelectedPlaneId(null);
  };

  const canEnableILS = (p: Plane) => {
    const rwX = 400;
    const rwY = 400;
    const rwHeading = 120;
    const dx = rwX - p.x;
    const dy = rwY - p.y;
    const dist = Math.hypot(dx, dy);

    let angleToRw = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angleToRw < 0) angleToRw += 360;
    let bearingToRw = angleToRw + 90;
    if (bearingToRw >= 360) bearingToRw -= 360;

    let bearingDiff = Math.abs(bearingToRw - rwHeading);
    if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;

    // Allow activation if within 600px and bearing within 20 degrees of centerline
    return dist < 600 && bearingDiff < 20;
  };

  return (
    <div className="flex gap-6 w-full max-w-[1400px] mx-auto h-[800px]">
      {/* Left Panel - Flight Lists */}
      <div className="w-72 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl overflow-y-auto flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-blue-400 mb-2 sticky top-0 bg-slate-800 pb-2 border-b border-slate-700">
            Incoming Flights
          </h2>
          {gameState.planes.filter(p => !p.ilsEnabled && p.status === 'flying').length === 0 ? (
            <div className="text-slate-500 text-sm text-center mt-4">No incoming flights</div>
          ) : (
            gameState.planes
              .filter(p => !p.ilsEnabled && p.status === 'flying')
              .sort((a, b) => b.altitude - a.altitude)
              .map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPlaneId(p.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedPlaneId === p.id ? 'bg-blue-900/50 border-blue-500' : p.warning ? 'bg-red-900/30 border-red-500/50' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{p.callsign}</span>
                    <span className="text-xs text-slate-400">{Math.round(p.heading)}°</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>{Math.round(p.altitude)} ft</span>
                    <span>{Math.round(p.speed)} kts</span>
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-700 pt-4">
          <h2 className="text-xl font-bold text-emerald-400 mb-2 sticky top-0 bg-slate-800 pb-2 border-b border-slate-700">
            Approach Queue (ILS)
          </h2>
          {gameState.planes.filter(p => p.ilsEnabled || p.status === 'landing' || p.status === 'landed').length === 0 ? (
            <div className="text-slate-500 text-sm text-center mt-4">No flights in approach queue</div>
          ) : (
            gameState.planes
              .filter(p => p.ilsEnabled || p.status === 'landing' || p.status === 'landed')
              .sort((a, b) => a.altitude - b.altitude) // Lower altitude = closer to landing
              .map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPlaneId(p.id)}
                  className={`p-3 rounded-lg border mb-2 cursor-pointer transition-colors ${selectedPlaneId === p.id ? 'bg-emerald-900/50 border-emerald-500' : p.status === 'landed' ? 'bg-emerald-900/20 border-emerald-500/30' : p.status === 'landing' ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{p.callsign}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'landed' ? 'bg-emerald-500 text-white' : p.status === 'landing' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {p.status === 'landed' ? 'Landed' : p.status === 'landing' ? 'Landing' : 'Approach'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>{Math.round(p.altitude)} ft</span>
                    <span>{Math.round(p.speed)} kts</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="relative flex-1 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 cursor-crosshair"
        />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="bg-slate-800 p-2 rounded text-white hover:bg-slate-700 border border-slate-600">+</button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="bg-slate-800 p-2 rounded text-white hover:bg-slate-700 border border-slate-600">-</button>
          <button onClick={() => {setZoom(1); setPan({x:0, y:0})}} className="bg-slate-800 p-2 rounded text-white hover:bg-slate-700 border border-slate-600 text-xs">Reset</button>
        </div>

        {gameState.gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl">
            <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over</h2>
            <p className="text-xl text-white mb-6">{gameState.message}</p>
            <button
              onClick={() => {
                setGameState({
                  planes: [],
                  score: 0,
                  gameOver: false,
                  message: "",
                  spawnTimer: 2,
                });
                setSelectedPlaneId(null);
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-lg transition-colors"
            >
              Restart
            </button>
          </div>
        )}
      </div>

      {/* Right Panel - Control & Settings */}
      <div className="w-80 flex flex-col gap-4 h-full">
        {/* Selected Plane Controls */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl shrink-0">
          <h2 className="text-xl font-bold text-blue-400 mb-3 border-b border-slate-700 pb-2">
            Flight Control
          </h2>
          {selectedPlane ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-700/50 p-2 rounded-lg border border-slate-600">
                <span className="text-emerald-400 font-bold text-lg">{selectedPlane.callsign}</span>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400">Current Heading</span>
                  <span className="text-white font-mono">{Math.round(selectedPlane.heading)}°</span>
                </div>
              </div>
              
              {selectedPlane.status === 'landed' ? (
                <div className="flex flex-col gap-4 py-2">
                  <div className="bg-emerald-900/30 border border-emerald-500/50 p-3 rounded-lg text-center">
                    <div className="text-emerald-400 font-bold mb-1">Successful Landing</div>
                    <div className="text-xs text-slate-300">Aircraft stopped on runway</div>
                  </div>
                  <button 
                    onClick={() => removePlane(selectedPlane.id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Finish Landing & Clear</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className={selectedPlane.ilsEnabled || selectedPlane.status === 'landing' ? 'opacity-40 pointer-events-none' : ''}>
                    <label className="text-xs text-slate-300 flex justify-between mb-1">
                      <span>Target Altitude</span>
                      <span className="font-mono text-emerald-300">{selectedPlane.targetAltitude} ft</span>
                    </label>
                    <input 
                      type="range" 
                      min="1000" max="15000" step="500" 
                      value={selectedPlane.targetAltitude}
                      onChange={(e) => handleCommand(selectedPlane.id, { targetAltitude: Number(e.target.value) })}
                      className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className={selectedPlane.ilsEnabled || selectedPlane.status === 'landing' ? 'opacity-40 pointer-events-none' : ''}>
                    <label className="text-xs text-slate-300 flex justify-between mb-1">
                      <span>Target Speed</span>
                      <span className="font-mono text-amber-300">{selectedPlane.targetSpeed} kts</span>
                    </label>
                    <input 
                      type="range" 
                      min="140" max="350" step="10" 
                      value={selectedPlane.targetSpeed}
                      onChange={(e) => handleCommand(selectedPlane.id, { targetSpeed: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-700">
                    <div className={`flex justify-between items-center ${selectedPlane.status === 'landing' ? 'opacity-40 pointer-events-none' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-300">ILS System</span>
                        {!canEnableILS(selectedPlane) && !selectedPlane.ilsEnabled && (
                          <span className="text-[10px] text-amber-500">Not on centerline</span>
                        )}
                      </div>
                      <button 
                        disabled={!canEnableILS(selectedPlane) && !selectedPlane.ilsEnabled}
                        onClick={() => handleCommand(selectedPlane.id, { ilsEnabled: !selectedPlane.ilsEnabled })}
                        className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${selectedPlane.ilsEnabled ? 'bg-emerald-500 text-white' : canEnableILS(selectedPlane) ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                      >
                        {selectedPlane.ilsEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    
                    {(selectedPlane.ilsEnabled || selectedPlane.status === 'landing') && (
                      <button 
                        onClick={() => handleCommand(selectedPlane.id, { 
                          ilsEnabled: false, 
                          status: 'flying', 
                          targetAltitude: 3000, 
                          targetSpeed: 220,
                          waypoints: [] 
                        })}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-bold transition-colors"
                      >
                        GO AROUND (Abort Landing)
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-sm text-center py-8 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
              Select a flight from radar or list
            </div>
          )}
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-slate-300">Score:</span>
            <span className="font-bold text-white text-lg">{gameState.score}</span>
          </div>
          
          <div className="border-t border-slate-700 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Game Speed:</span>
              <span className="font-bold text-white text-sm">{gameSpeed === 0 ? 'Paused' : `${gameSpeed}x`}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setGameSpeed(0)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${gameSpeed === 0 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>||</button>
              <button onClick={() => setGameSpeed(0.5)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${gameSpeed === 0.5 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>.5x</button>
              <button onClick={() => setGameSpeed(1)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${gameSpeed === 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>1x</button>
              <button onClick={() => setGameSpeed(2)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${gameSpeed === 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>2x</button>
              <button onClick={() => setGameSpeed(4)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${gameSpeed === 4 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>4x</button>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Traffic Rate:</span>
              <span className="font-bold text-white text-sm">{trafficRate === 0.5 ? 'Low' : trafficRate === 1 ? 'Medium' : 'High'}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setTrafficRate(0.5)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${trafficRate === 0.5 ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Low</button>
              <button onClick={() => setTrafficRate(1)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${trafficRate === 1 ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Medium</button>
              <button onClick={() => setTrafficRate(2)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${trafficRate === 2 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>High</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
