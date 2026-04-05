/** TWIN WORLD RenderEngine interface definitions */

/** 2D座標 */
export interface Vector2 {
  x: number;
  y: number;
}

/** スプライト情報 */
export interface Sprite {
  id: string;
  position: Vector2;
  size: Vector2;
  color: string;
  label?: string;
}

/** レンダリング対象のゲームオブジェクト */
export interface GameObject {
  id: string;
  type: string;
  position: Vector2;
  size: Vector2;
  sprite: Sprite;
  visible: boolean;
  layer: number;
}

/** カメラ設定 */
export interface Camera {
  position: Vector2;
  zoom: number;
  viewportSize: Vector2;
}

/** レンダリングエンジンのインターフェース */
export interface IRenderEngine {
  /** エンジン初期化。canvasを受け取り描画可能な状態にする */
  init(canvas: HTMLCanvasElement): void;

  /** 描画対象を登録する */
  addObject(obj: GameObject): void;

  /** 描画対象を削除する */
  removeObject(id: string): void;

  /** 描画対象を更新する */
  updateObject(id: string, partial: Partial<GameObject>): void;

  /** 全描画対象を取得する */
  getObjects(): GameObject[];

  /** カメラを設定する */
  setCamera(camera: Partial<Camera>): void;

  /** 現在のカメラを取得する */
  getCamera(): Camera;

  /** 1フレーム描画する */
  render(): void;

  /** 描画ループを開始する */
  start(): void;

  /** 描画ループを停止する */
  stop(): void;

  /** リソースを解放する */
  destroy(): void;
}

/** 入力イベントの種類 */
export type InputEventType = "click" | "move" | "keydown" | "keyup";

/** 入力イベント */
export interface InputEvent {
  type: InputEventType;
  position?: Vector2;
  key?: string;
}

/** 入力ハンドラのインターフェース */
export interface IInputHandler {
  onInput(callback: (event: InputEvent) => void): void;
  destroy(): void;
}
