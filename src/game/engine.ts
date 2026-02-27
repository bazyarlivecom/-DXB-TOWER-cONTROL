import { Plane, GameState } from "../types";

export const cos30 = Math.cos(30 * Math.PI / 180);
export const sin30 = Math.sin(30 * Math.PI / 180);

// Runway 12 (Heading 120)
const RW12_X = 400;
const RW12_Y = 400;
const RW12_H = 120;

export const PATTERN = {
  RW12: {
    FINAL: { x: RW12_X - 150 * cos30, y: RW12_Y - 150 * sin30 },
    FAF: { x: RW12_X - 300 * cos30, y: RW12_Y - 300 * sin30 },
    IAF: { x: RW12_X - 450 * cos30, y: RW12_Y - 450 * sin30 },
    ENTRY: { x: RW12_X - 600 * cos30, y: RW12_Y - 600 * sin30 },
    
    // Inner Downwind (250px offset) - Rectangular pattern
    DW_I1: { x: RW12_X - 600 * cos30 + 250 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 600 * sin30 + 250 * Math.sin(-60 * Math.PI / 180) },
    DW_I2: { x: RW12_X - 350 * cos30 + 250 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 350 * sin30 + 250 * Math.sin(-60 * Math.PI / 180) },
    DW_I3: { x: RW12_X - 100 * cos30 + 250 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 100 * sin30 + 250 * Math.sin(-60 * Math.PI / 180) },
    DW_I4: { x: RW12_X + 150 * cos30 + 250 * Math.cos(-60 * Math.PI / 180), y: RW12_Y + 150 * sin30 + 250 * Math.sin(-60 * Math.PI / 180) },
    DW_I5: { x: RW12_X + 400 * cos30 + 250 * Math.cos(-60 * Math.PI / 180), y: RW12_Y + 400 * sin30 + 250 * Math.sin(-60 * Math.PI / 180) },
    
    // Outer Downwind (350px offset)
    DW_O1: { x: RW12_X - 600 * cos30 + 350 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 600 * sin30 + 350 * Math.sin(-60 * Math.PI / 180) },
    DW_O2: { x: RW12_X - 350 * cos30 + 350 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 350 * sin30 + 350 * Math.sin(-60 * Math.PI / 180) },
    DW_O3: { x: RW12_X - 100 * cos30 + 350 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 100 * sin30 + 350 * Math.sin(-60 * Math.PI / 180) },
    DW_O4: { x: RW12_X + 150 * cos30 + 350 * Math.cos(-60 * Math.PI / 180), y: RW12_Y + 150 * sin30 + 350 * Math.sin(-60 * Math.PI / 180) },
    DW_O5: { x: RW12_X + 400 * cos30 + 350 * Math.cos(-60 * Math.PI / 180), y: RW12_Y + 400 * sin30 + 350 * Math.sin(-60 * Math.PI / 180) },

    // Extended Downwind (450px offset)
    DW_E1: { x: RW12_X - 600 * cos30 + 450 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 600 * sin30 + 450 * Math.sin(-60 * Math.PI / 180) },
    DW_E2: { x: RW12_X - 350 * cos30 + 450 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 350 * sin30 + 450 * Math.sin(-60 * Math.PI / 180) },
    DW_E3: { x: RW12_X - 100 * cos30 + 450 * Math.cos(-60 * Math.PI / 180), y: RW12_Y - 100 * sin30 + 450 * Math.sin(-60 * Math.PI / 180) },
    DW_E4: { x: RW12_X + 150 * cos30 + 450 * Math.cos(-60 * Math.PI / 180), y: RW12_Y + 150 * sin30 + 450 * Math.sin(-60 * Math.PI / 180) },
    DW_E5: { x: RW12_X + 400 * cos30 + 450 * Math.cos(-60 * Math.PI / 180), y: RW12_Y + 400 * sin30 + 450 * Math.sin(-60 * Math.PI / 180) },
  },
  HOLD: {
    NW: { x: 150, y: 150 },
    NE: { x: 650, y: 150 },
    SW: { x: 150, y: 650 },
    SE: { x: 650, y: 650 },
    CENTER_N: { x: 400, y: 100 },
    CENTER_S: { x: 400, y: 700 },
  }
};

const AIRLINES = [
  "UAE",
  "QTR",
  "BAW",
  "DLH",
  "AFR",
  "KLM",
  "SIA",
  "THY",
  "IRB",
  "IRA",
];

function randomCallsign() {
  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${airline}${number}`;
}

export function spawnPlane(): Plane {
  const edge = Math.floor(Math.random() * 4);
  let x = 0,
    y = 0;
  const size = 1600; // Larger spawn area
  const offset = -400; // Offset to center around 400,400

  if (edge === 0) {
    x = Math.random() * size + offset;
    y = offset;
  } else if (edge === 1) {
    x = size + offset;
    y = Math.random() * size + offset;
  } else if (edge === 2) {
    x = Math.random() * size + offset;
    y = size + offset;
  } else {
    x = offset;
    y = Math.random() * size + offset;
  }

  const angleToCenter = Math.atan2(400 - y, 400 - x);
  let heading = (angleToCenter * 180) / Math.PI + 90;
  if (heading < 0) heading += 360;

  heading += (Math.random() - 0.5) * 60;
  if (heading < 0) heading += 360;
  if (heading >= 360) heading -= 360;

  return {
    id: Math.random().toString(36).substring(2, 11),
    callsign: randomCallsign(),
    x,
    y,
    heading,
    targetHeading: Math.round(heading),
    altitude: 10000 + Math.floor(Math.random() * 5) * 1000,
    targetAltitude: 10000,
    speed: 250,
    targetSpeed: 250,
    status: "flying",
    trail: [],
    waypoints: [],
    ilsEnabled: false,
    warning: false,
  };
}

export function updateGame(state: GameState, dt: number, trafficRate: number = 1): GameState {
  if (state.gameOver) return state;

  let newState = { ...state };
  newState.planes = newState.planes.map((p) => ({ ...p, trail: [...p.trail], waypoints: p.waypoints ? [...p.waypoints] : [] }));

  newState.spawnTimer -= dt * trafficRate;
  if (newState.spawnTimer <= 0 && newState.planes.length < newState.maxPlanes) {
    newState.planes.push(spawnPlane());
    newState.spawnTimer = 25 + Math.random() * 20;
  }

  const runways = [
    { x: 400, y: 400, heading: 120 },
  ];

  newState.planes.forEach((p) => (p.warning = false));

  for (let p of newState.planes) {
    if (
      p.status === "landed" ||
      p.status === "crashed" ||
      p.status === "escaped"
    )
      continue;

    if (p.waypoints && p.waypoints.length > 0) {
      const wp = p.waypoints[0];
      const dx = wp.x - p.x;
      const dy = wp.y - p.y;
      const dist = Math.hypot(dx, dy);
      
      // More forgiving threshold for reaching waypoints
      if (dist < 40) {
        // Check if this waypoint is near a HOLD point
        const holdPoint = Object.values(PATTERN.HOLD).find(h => Math.hypot(h.x - wp.x, h.y - wp.y) < 50);
        if (holdPoint && p.waypoints.length === 1) {
          p.holdingPoint = { x: holdPoint.x, y: holdPoint.y };
        }
        p.waypoints.shift();
      } else {
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle += 90;
        if (angle < 0) angle += 360;
        if (angle >= 360) angle -= 360;
        p.targetHeading = angle;
      }
    }

    // Auto-hold if near a hold point and no instructions
    if (!p.holdingPoint && (!p.waypoints || p.waypoints.length === 0) && p.status === 'flying') {
      const holdPoint = Object.values(PATTERN.HOLD).find(h => Math.hypot(h.x - p.x, h.y - p.y) < 60);
      if (holdPoint) {
        p.holdingPoint = { x: holdPoint.x, y: holdPoint.y };
      }
    }

    // Holding orbit logic
    if (p.holdingPoint && (!p.waypoints || p.waypoints.length === 0)) {
      const dx = p.x - p.holdingPoint.x;
      const dy = p.y - p.holdingPoint.y;
      const dist = Math.hypot(dx, dy);
      const orbitRadius = 60; // Slightly larger orbit for visibility
      
      // Current heading from center to plane in engine units
      let angleFromCenter = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
      
      // We want to fly perpendicular to the radius (clockwise)
      // And slightly inward if we are too far, outward if too close
      const distError = dist - orbitRadius;
      const correctionAngle = Math.max(-60, Math.min(60, distError * 3)); // Max 60 degree correction
      
      let targetHeading = angleFromCenter + 90 + correctionAngle;
      
      // Normalize
      while (targetHeading < 0) targetHeading += 360;
      while (targetHeading >= 360) targetHeading -= 360;
      
      p.targetHeading = targetHeading;
      // Slow down while holding for better stability
      p.targetSpeed = Math.min(p.targetSpeed, 180);
    } else if (p.waypoints && p.waypoints.length > 0) {
      // If we have new waypoints, stop holding
      p.holdingPoint = null;
    }

    if (p.heading !== p.targetHeading) {
      let diff = p.targetHeading - p.heading;
      while (diff <= -180) diff += 360;
      while (diff > 180) diff -= 360;

      // Turn rate depends on speed (faster = wider turn = slower turn rate in degrees)
      // Radius = v^2 / (g * tan(theta)). We use a constant to simulate a fixed max bank angle.
      // K = 600 gives a turn radius of ~150px at 250kts, and ~50px at 150kts.
      const maxTurnRate = (600 / Math.max(p.speed, 100)) * dt; 
      if (Math.abs(diff) < maxTurnRate) {
        p.heading = p.targetHeading;
      } else {
        p.heading += Math.sign(diff) * maxTurnRate;
      }
      if (p.heading < 0) p.heading += 360;
      if (p.heading >= 360) p.heading -= 360;
    }

    if (p.speed !== p.targetSpeed) {
      const accel = 5 * dt;
      if (Math.abs(p.targetSpeed - p.speed) < accel) {
        p.speed = p.targetSpeed;
      } else {
        p.speed += Math.sign(p.targetSpeed - p.speed) * accel;
      }
    }

    if (p.altitude !== p.targetAltitude) {
      const climbRate = 400 * dt;
      if (Math.abs(p.targetAltitude - p.altitude) < climbRate) {
        p.altitude = p.targetAltitude;
      } else {
        p.altitude += Math.sign(p.targetAltitude - p.altitude) * climbRate;
      }
    }

    const mathAngle = ((p.heading - 90) * Math.PI) / 180;
    const speedPx = p.speed * 0.025 * dt;

    p.x += Math.cos(mathAngle) * speedPx;
    p.y += Math.sin(mathAngle) * speedPx;

    if (
      p.trail.length === 0 ||
      Math.hypot(
        p.x - p.trail[p.trail.length - 1].x,
        p.y - p.trail[p.trail.length - 1].y,
      ) > 15
    ) {
      p.trail.push({ x: p.x, y: p.y, speed: p.speed });
      if (p.trail.length > 50) p.trail.shift();
    }

    if (p.status === "flying") {
      // Check for auto-approach waypoints
      const approachRoutes = [
        // RW12 Inner Downwind
        { point: PATTERN.RW12.DW_I5, route: [PATTERN.RW12.DW_I4, PATTERN.RW12.DW_I3, PATTERN.RW12.DW_I2, PATTERN.RW12.DW_I1, PATTERN.RW12.ENTRY, PATTERN.RW12.IAF, PATTERN.RW12.FAF, PATTERN.RW12.FINAL], alt: 3000, spd: 200 },
        // RW12 Outer Downwind
        { point: PATTERN.RW12.DW_O5, route: [PATTERN.RW12.DW_O4, PATTERN.RW12.DW_O3, PATTERN.RW12.DW_O2, PATTERN.RW12.DW_O1, PATTERN.RW12.ENTRY, PATTERN.RW12.IAF, PATTERN.RW12.FAF, PATTERN.RW12.FINAL], alt: 4000, spd: 220 },
        // RW12 Extended Downwind
        { point: PATTERN.RW12.DW_E5, route: [PATTERN.RW12.DW_E4, PATTERN.RW12.DW_E3, PATTERN.RW12.DW_E2, PATTERN.RW12.DW_E1, PATTERN.RW12.ENTRY, PATTERN.RW12.IAF, PATTERN.RW12.FAF, PATTERN.RW12.FINAL], alt: 5000, spd: 240 },
        
        { point: PATTERN.RW12.ENTRY, route: [PATTERN.RW12.IAF, PATTERN.RW12.FAF, PATTERN.RW12.FINAL], alt: 2500, spd: 190 },
        { point: PATTERN.RW12.IAF, route: [PATTERN.RW12.FAF, PATTERN.RW12.FINAL], alt: 2000, spd: 180 },
      ];

      for (let ar of approachRoutes) {
        if (Math.hypot(p.x - ar.point.x, p.y - ar.point.y) < 20 && p.waypoints.length === 0) {
          p.targetAltitude = ar.alt;
          p.targetSpeed = ar.spd;
          p.waypoints = [...ar.route];
        }
      }
    }

    if (p.status === "flying" && p.ilsEnabled) {
      for (let rw of runways) {
        const dx = rw.x - p.x;
        const dy = rw.y - p.y;
        const dist = Math.hypot(dx, dy);

        let angleToRw = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angleToRw < 0) angleToRw += 360;
        let bearingToRw = angleToRw + 90;
        if (bearingToRw >= 360) bearingToRw -= 360;

        let headingDiff = Math.abs(p.heading - rw.heading);
        if (headingDiff > 180) headingDiff = 360 - headingDiff;

        let bearingDiff = Math.abs(bearingToRw - rw.heading);
        if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;

        // ILS Intercept: within 500px, bearing within 15 deg, heading within 45 deg, altitude <= 4000
        if (
          dist < 500 &&
          bearingDiff < 15 &&
          headingDiff < 45 &&
          p.altitude <= 4000
        ) {
          p.status = "landing";
          p.targetAltitude = 0;
          p.targetSpeed = 130;
          p.targetHeading = rw.heading;
          p.waypoints = [];
        }
      }
    }

    if (p.status === "landing") {
      const distToRw = Math.hypot(p.x - 400, p.y - 400);
      
      // Localizer logic: pull towards the runway centerline (Heading 120)
      const rwHeadingRad = (120 - 90) * Math.PI / 180;
      const dx = p.x - 400;
      const dy = p.y - 400;
      // Cross track error
      const crossTrackError = -dx * Math.sin(rwHeadingRad) + dy * Math.cos(rwHeadingRad);
      // Stronger correction to ensure alignment
      p.targetHeading = 120 - Math.max(-60, Math.min(60, crossTrackError * 4));

      // Glide slope: 3000ft at 400px -> 7.5ft per pixel
      p.targetAltitude = Math.max(0, Math.min(p.altitude, distToRw * 7.5));
      p.targetSpeed = Math.max(130, Math.min(p.speed, 130 + (distToRw / 4)));

      if (distToRw < 30) {
        p.status = "landed";
        p.altitude = 0;
        p.speed = 0;
        p.targetSpeed = 0;
        p.waypoints = [];
        newState.score += 100;
        newState.planesLanded += 1;
      }
    }

    if (p.x < -1000 || p.x > 1800 || p.y < -1000 || p.y > 1800) {
      p.status = "escaped";
      newState.score -= 50;
    }
  }

  for (let i = 0; i < newState.planes.length; i++) {
    for (let j = i + 1; j < newState.planes.length; j++) {
      const p1 = newState.planes[i];
      const p2 = newState.planes[j];
      if (p1.status === "landed" || p2.status === "landed") continue;
      if (p1.status === "crashed" || p2.status === "crashed") continue;
      if (p1.status === "escaped" || p2.status === "escaped") continue;

      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const altDiff = Math.abs(p1.altitude - p2.altitude);

      if (dist < 30 && altDiff < 1000) {
        p1.warning = true;
        p2.warning = true;
        if (dist < 10 && altDiff < 500) {
          p1.status = "crashed";
          p2.status = "crashed";
          newState.gameOver = true;
          newState.message = "Mid-air collision! Game Over.";
        }
      }
    }
  }

  if (!newState.gameOver) {
    newState.planes = newState.planes.filter(
      (p) =>
        p.status !== "crashed" &&
        p.status !== "escaped",
    );
  }

  return newState;
}
