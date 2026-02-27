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
  holdingPoint?: { x: number; y: number } | null;
}

export interface GameRecord {
  score: number;
  date: string;
  planesLanded: number;
}

export interface GameState {
  planes: Plane[];
  score: number;
  planesLanded: number;
  gameOver: boolean;
  message: string;
  spawnTimer: number;
  highScore: number;
  history: GameRecord[];
  maxPlanes: number;
}
