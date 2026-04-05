import type { IRenderEngine, GameObject, Camera } from "@/types/engine";

/**
 * Canvas 2D ベースのレンダリングエンジン実装。
 * 現時点ではシンプルな矩形描画のみ。
 * 将来的にスプライトシート、パーティクル等を追加できる設計。
 */
export class RenderEngine implements IRenderEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private objects = new Map<string, GameObject>();
  private camera: Camera = {
    position: { x: 0, y: 0 },
    zoom: 1,
    viewportSize: { x: 800, y: 600 },
  };
  private animationFrameId: number | null = null;
  private running = false;

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.camera.viewportSize = {
      x: canvas.width,
      y: canvas.height,
    };
  }

  addObject(obj: GameObject): void {
    this.objects.set(obj.id, obj);
  }

  removeObject(id: string): void {
    this.objects.delete(id);
  }

  updateObject(id: string, partial: Partial<GameObject>): void {
    const obj = this.objects.get(id);
    if (obj) {
      this.objects.set(id, { ...obj, ...partial });
    }
  }

  getObjects(): GameObject[] {
    return Array.from(this.objects.values());
  }

  setCamera(camera: Partial<Camera>): void {
    this.camera = { ...this.camera, ...camera };
  }

  getCamera(): Camera {
    return { ...this.camera };
  }

  render(): void {
    if (!this.ctx || !this.canvas) return;

    const { ctx, canvas } = this;
    const { position: cam, zoom } = this.camera;

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // カメラ変換
    ctx.scale(zoom, zoom);
    ctx.translate(-cam.x, -cam.y);

    // レイヤー順にソートして描画
    const sorted = Array.from(this.objects.values())
      .filter((o) => o.visible)
      .sort((a, b) => a.layer - b.layer);

    for (const obj of sorted) {
      const { sprite, position, size } = obj;

      // 矩形描画
      ctx.fillStyle = sprite.color;
      ctx.fillRect(position.x, position.y, size.x, size.y);

      // ラベル描画
      if (sprite.label) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          sprite.label,
          position.x + size.x / 2,
          position.y - 4
        );
      }
    }

    ctx.restore();
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    const loop = () => {
      if (!this.running) return;
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.objects.clear();
    this.canvas = null;
    this.ctx = null;
  }
}
