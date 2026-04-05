import { useEffect, useRef } from "react";
import { RenderEngine } from "./RenderEngine";
import type { GameObject } from "@/types/engine";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

/** デモ用キャラクター */
const demoCharacter: GameObject = {
  id: "player-1",
  type: "character",
  position: { x: 370, y: 260 },
  size: { x: 48, y: 64 },
  sprite: {
    id: "sprite-player-1",
    position: { x: 370, y: 260 },
    size: { x: 48, y: 64 },
    color: "#7df9ff",
    label: "Player",
  },
  visible: true,
  layer: 1,
};

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export function GameCanvas({
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RenderEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new RenderEngine();
    engine.init(canvas);
    engine.addObject(demoCharacter);
    engine.start();
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: "1px solid #333",
        borderRadius: "4px",
        background: "#0f0f23",
        display: "block",
      }}
    />
  );
}
