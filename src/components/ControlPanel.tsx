import React, { useState, useEffect } from "react";
import { Plane } from "../types";
import { Compass, Gauge, ArrowUpToLine } from "lucide-react";

interface Props {
  plane: Plane;
  onCommand: (id: string, updates: Partial<Plane>) => void;
}

export default function ControlPanel({ plane, onCommand }: Props) {
  const [heading, setHeading] = useState(plane.targetHeading);
  const [altitude, setAltitude] = useState(plane.targetAltitude);
  const [speed, setSpeed] = useState(plane.targetSpeed);

  useEffect(() => {
    setHeading(plane.targetHeading);
    setAltitude(plane.targetAltitude);
    setSpeed(plane.targetSpeed);
  }, [plane.id]);

  const handleApply = () => {
    onCommand(plane.id, {
      targetHeading: heading,
      targetAltitude: altitude,
      targetSpeed: speed,
      waypoints: [],
    });
  };

  return (
    <div
      className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex-1 flex flex-col"
    >
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-bold text-blue-400">{plane.callsign}</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            plane.status === "landing"
              ? "bg-emerald-500/20 text-emerald-400"
              : plane.holdingPoint
              ? "bg-amber-500/20 text-amber-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {plane.status === "landing" ? "Landing" : plane.holdingPoint ? "Holding" : "Flying"}
        </span>
      </div>

      <div className="space-y-6 flex-1">
        {/* Heading */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Compass className="w-5 h-5 text-blue-400" />
            <label className="font-bold">Heading</label>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="359"
              value={heading}
              onChange={(e) => setHeading(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <div className="w-16 text-center font-mono text-xl bg-slate-900 py-1 rounded border border-slate-700">
              {heading.toString().padStart(3, "0")}°
            </div>
          </div>
          <div
            className="text-xs text-slate-500 mt-2 flex justify-between px-1"
          >
            <span>0° (N)</span>
            <span>90° (E)</span>
            <span>180° (S)</span>
            <span>270° (W)</span>
          </div>
        </div>

        {/* Altitude */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <ArrowUpToLine className="w-5 h-5 text-emerald-400" />
            <label className="font-bold">Altitude</label>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1000"
              max="15000"
              step="500"
              value={altitude}
              onChange={(e) => setAltitude(Number(e.target.value))}
              className="flex-1 accent-emerald-500"
            />
            <div className="w-20 text-center font-mono text-xl bg-slate-900 py-1 rounded border border-slate-700">
              {altitude}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 text-left">
            Feet (ft)
          </div>
        </div>

        {/* Speed */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Gauge className="w-5 h-5 text-amber-400" />
            <label className="font-bold">Speed</label>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="140"
              max="350"
              step="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <div className="w-20 text-center font-mono text-xl bg-slate-900 py-1 rounded border border-slate-700">
              {speed}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 text-left">
            Knots (kts)
          </div>
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={plane.status === "landing"}
        className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
      >
        Apply Commands
      </button>
    </div>
  );
}
