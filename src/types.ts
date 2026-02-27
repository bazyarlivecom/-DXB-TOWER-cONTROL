export interface Plane {
  id: string;
  callsign: string;
  x: number;
  y: number;
  heading: number;
  targetHeading: number;
  altitude: number;
  targetAltitude: number;
  speed: number;
  targetSpeed: number;
  status: "flying" | "landing" | "landed" | "crashed" | "escaped";
  trail: { x: number; y: number; speed: number }[];
  waypoints: { x: number; y: number }[];
  ilsEnabled: boolean;
  warning: boolean;
}

export interface GameState {
  planes: Plane[];
  score: number;
  gameOver: boolean;
  message: string;
  spawnTimer: number;
}
