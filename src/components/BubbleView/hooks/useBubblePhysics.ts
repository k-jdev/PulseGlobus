import { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3-force";
import type { PositionedBubble } from "../types";

export interface PhysicsNode extends d3.SimulationNodeDatum {
  id: string;
  radius: number;
  isDragging: boolean;
  wanderAngle: number;
}

const PADDING = 5;
// how fast bubbles float on their own
const FLOAT_SPEED = 0.45;
// how often a bubble randomly changes direction
const WANDER_INTERVAL = 2800; //ms

export function useBubblePhysics(
  initialBubbles: PositionedBubble[],
  containerWidth: number,
  containerHeight: number,
) {
  const simRef = useRef<d3.Simulation<PhysicsNode, never> | null>(null);
  const nodesRef = useRef<Map<string, PhysicsNode>>(new Map());
  const domRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const wanderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const registerDom = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      domRefsMap.current.set(id, el);
    } else {
      domRefsMap.current.delete(id);
    }
  }, []);

  useEffect(() => {
    if (containerWidth === 0 || containerHeight === 0) return;

    const cx = containerWidth / 2;
    const cy = containerHeight / 2;

    const prevNodes = nodesRef.current;
    const newNodes = new Map<string, PhysicsNode>();

    for (const b of initialBubbles) {
      const prev = prevNodes.get(b.id);
      if (prev) {
        prev.radius = b.radius;
        newNodes.set(b.id, prev);
      } else {
        const spawnX = b.x ?? containerWidth * (0.1 + Math.random() * 0.8);
        const spawnY = b.y ?? containerHeight * (0.1 + Math.random() * 0.8);
        const angle = Math.random() * Math.PI * 2;
        newNodes.set(b.id, {
          id: b.id,
          radius: b.radius,
          x: spawnX,
          y: spawnY,
          vx: Math.cos(angle) * FLOAT_SPEED * (0.6 + Math.random() * 0.8),
          vy: Math.sin(angle) * FLOAT_SPEED * (0.6 + Math.random() * 0.8),
          isDragging: false,
          wanderAngle: angle,
        });
      }
    }

    nodesRef.current = newNodes;
    const nodesArray = Array.from(newNodes.values());

    if (simRef.current) simRef.current.stop();
    if (wanderTimerRef.current) clearInterval(wanderTimerRef.current);

    const sim = d3
      .forceSimulation<PhysicsNode>(nodesArray)

      .force(
        "collide",
        d3
          .forceCollide<PhysicsNode>()
          .radius((d) => d.radius + PADDING)
          .strength(0.85)
          .iterations(2),
      )

      .velocityDecay(0.08)
      .alphaDecay(0)
      .alphaMin(0)
      .alpha(1)
      .on("tick", () => {
        const nodes = nodesRef.current;
        const doms = domRefsMap.current;

        for (const node of nodes.values()) {
          if (node.isDragging) continue;

          const r = node.radius;

          if ((node.x ?? 0) - r < 0) {
            node.x = r;
            node.vx = Math.abs(node.vx ?? 0) * 0.8;
          } else if ((node.x ?? 0) + r > containerWidth) {
            node.x = containerWidth - r;
            node.vx = -Math.abs(node.vx ?? 0) * 0.8;
          }

          if ((node.y ?? 0) - r < 0) {
            node.y = r;
            node.vy = Math.abs(node.vy ?? 0) * 0.8;
          } else if ((node.y ?? 0) + r > containerHeight) {
            node.y = containerHeight - r;
            node.vy = -Math.abs(node.vy ?? 0) * 0.8;
          }

          // Keep minimum speed — nudge if too slow
          const spd = Math.sqrt((node.vx ?? 0) ** 2 + (node.vy ?? 0) ** 2);
          if (spd < FLOAT_SPEED * 0.25) {
            const a = node.wanderAngle;
            node.vx = Math.cos(a) * FLOAT_SPEED * 0.5;
            node.vy = Math.sin(a) * FLOAT_SPEED * 0.5;
          }

          const el = doms.get(node.id);
          if (el) {
            el.style.transform = `translate(${(node.x ?? cx) - r}px, ${(node.y ?? cy) - r}px)`;
          }
        }
      });

    simRef.current = sim;

    wanderTimerRef.current = setInterval(
      () => {
        for (const node of nodesRef.current.values()) {
          if (node.isDragging) continue;

          node.wanderAngle += (Math.random() - 0.5) * (Math.PI / 1.5);
          const nudge = FLOAT_SPEED * 0.35;
          node.vx = (node.vx ?? 0) + Math.cos(node.wanderAngle) * nudge;
          node.vy = (node.vy ?? 0) + Math.sin(node.wanderAngle) * nudge;

          const spd = Math.sqrt((node.vx ?? 0) ** 2 + (node.vy ?? 0) ** 2);
          if (spd > FLOAT_SPEED * 2.5) {
            node.vx = ((node.vx ?? 0) / spd) * FLOAT_SPEED * 2.5;
            node.vy = ((node.vy ?? 0) / spd) * FLOAT_SPEED * 2.5;
          }
        }

        simRef.current?.alpha(1).restart();
      },
      WANDER_INTERVAL + Math.random() * 600,
    );

    return () => {
      sim.stop();
      if (wanderTimerRef.current) clearInterval(wanderTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBubbles, containerWidth, containerHeight]);

  const startDrag = useCallback((id: string) => {
    const node = nodesRef.current.get(id);
    if (!node) return;
    node.isDragging = true;
    node.fx = node.x;
    node.fy = node.y;
    simRef.current?.alpha(0.4).restart();
  }, []);

  const updateDrag = useCallback((id: string, x: number, y: number) => {
    const node = nodesRef.current.get(id);
    if (!node || !node.isDragging) return;
    node.fx = x;
    node.fy = y;
    const el = domRefsMap.current.get(id);
    if (el) {
      el.style.transform = `translate(${x - node.radius}px, ${y - node.radius}px)`;
    }
  }, []);

  const endDrag = useCallback((id: string, vx?: number, vy?: number) => {
    const node = nodesRef.current.get(id);
    if (!node) return;
    node.isDragging = false;
    node.fx = null;
    node.fy = null;
    if (vx !== undefined && vy !== undefined) {
      const maxSpeed = 4;
      node.vx = Math.max(-maxSpeed, Math.min(maxSpeed, vx * 0.003));
      node.vy = Math.max(-maxSpeed, Math.min(maxSpeed, vy * 0.003));
    }
    simRef.current?.alpha(0.5).restart();
  }, []);

  return { registerDom, startDrag, updateDrag, endDrag };
}
