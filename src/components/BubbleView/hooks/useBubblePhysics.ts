import { useRef, useEffect, useState, useCallback } from "react";
import type { PositionedBubble } from "../types";

interface PhysicsBubble {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isDragging: boolean;
}

const BASE_SPEED = 0.35;
const DAMPING = 0.998;
const COLLISION_DAMPING = 0.7;
const PADDING = 4;

export function useBubblePhysics(
  initialBubbles: PositionedBubble[],
  containerWidth: number,
  containerHeight: number,
) {
  const physicsRef = useRef<Map<string, PhysicsBubble>>(new Map());
  const rafRef = useRef<number>(0);
  const [positions, setPositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());

  useEffect(() => {
    const existing = physicsRef.current;
    const newMap = new Map<string, PhysicsBubble>();

    for (const b of initialBubbles) {
      const prev = existing.get(b.id);
      if (prev) {
        // Keep existing velocity & position, update radius
        newMap.set(b.id, { ...prev, radius: b.radius });
      } else {
        // New bubble — random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * (0.5 + Math.random() * 0.8);
        newMap.set(b.id, {
          id: b.id,
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: b.radius,
          isDragging: false,
        });
      }
    }

    physicsRef.current = newMap;
  }, [initialBubbles]);

  // Main physics loop
  useEffect(() => {
    if (containerWidth === 0 || containerHeight === 0) return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 32); // cap delta to ~30fps minimum
      lastTime = now;

      const bodies = physicsRef.current;
      const arr = Array.from(bodies.values());

      // Update positions
      for (const b of arr) {
        if (b.isDragging) continue;

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Apply gentle damping
        b.vx *= DAMPING;
        b.vy *= DAMPING;

        // Keep minimum speed so they keep floating
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed < BASE_SPEED * 0.3) {
          const angle = Math.atan2(b.vy, b.vx);
          const targetSpeed = BASE_SPEED * (0.4 + Math.random() * 0.3);
          b.vx = Math.cos(angle) * targetSpeed;
          b.vy = Math.sin(angle) * targetSpeed;
        }

        // Bounce off walls
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx) * COLLISION_DAMPING;
        }
        if (b.x + b.radius > containerWidth) {
          b.x = containerWidth - b.radius;
          b.vx = -Math.abs(b.vx) * COLLISION_DAMPING;
        }
        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = Math.abs(b.vy) * COLLISION_DAMPING;
        }
        if (b.y + b.radius > containerHeight) {
          b.y = containerHeight - b.radius;
          b.vy = -Math.abs(b.vy) * COLLISION_DAMPING;
        }
      }

      // Collision detection between bubbles
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius + b.radius + PADDING;

          if (dist < minDist && dist > 0) {
            // Separate overlapping bubbles
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) / 2;

            if (!a.isDragging) {
              a.x -= nx * overlap;
              a.y -= ny * overlap;
            }
            if (!b.isDragging) {
              b.x += nx * overlap;
              b.y += ny * overlap;
            }

            // Exchange velocities along collision normal
            if (!a.isDragging && !b.isDragging) {
              const dvx = a.vx - b.vx;
              const dvy = a.vy - b.vy;
              const dvDotN = dvx * nx + dvy * ny;

              if (dvDotN > 0) {
                // Mass proportional to area
                const mA = a.radius * a.radius;
                const mB = b.radius * b.radius;
                const totalMass = mA + mB;

                a.vx -=
                  ((2 * mB) / totalMass) * dvDotN * nx * COLLISION_DAMPING;
                a.vy -=
                  ((2 * mB) / totalMass) * dvDotN * ny * COLLISION_DAMPING;
                b.vx +=
                  ((2 * mA) / totalMass) * dvDotN * nx * COLLISION_DAMPING;
                b.vy +=
                  ((2 * mA) / totalMass) * dvDotN * ny * COLLISION_DAMPING;
              }
            } else if (a.isDragging && !b.isDragging) {
              // Push b away from dragged a
              b.vx += nx * 1.5;
              b.vy += ny * 1.5;
            } else if (!a.isDragging && b.isDragging) {
              a.vx -= nx * 1.5;
              a.vy -= ny * 1.5;
            }
          }
        }
      }

      // Update React state (throttled to ~60fps via rAF)
      const newPositions = new Map<string, { x: number; y: number }>();
      for (const b of arr) {
        newPositions.set(b.id, { x: b.x, y: b.y });
      }
      setPositions(newPositions);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [containerWidth, containerHeight]);

  // Drag handlers
  const startDrag = useCallback((id: string) => {
    const b = physicsRef.current.get(id);
    if (b) {
      b.isDragging = true;
      b.vx = 0;
      b.vy = 0;
    }
  }, []);

  const updateDrag = useCallback((id: string, x: number, y: number) => {
    const b = physicsRef.current.get(id);
    if (b && b.isDragging) {
      b.x = x;
      b.y = y;
    }
  }, []);

  const endDrag = useCallback(
    (id: string, velocityX?: number, velocityY?: number) => {
      const b = physicsRef.current.get(id);
      if (b) {
        b.isDragging = false;
        // Apply throw velocity (clamped)
        if (velocityX !== undefined && velocityY !== undefined) {
          const maxThrowSpeed = 2;
          b.vx = Math.max(
            -maxThrowSpeed,
            Math.min(maxThrowSpeed, velocityX * 0.003),
          );
          b.vy = Math.max(
            -maxThrowSpeed,
            Math.min(maxThrowSpeed, velocityY * 0.003),
          );
        }
      }
    },
    [],
  );

  return { positions, startDrag, updateDrag, endDrag };
}
