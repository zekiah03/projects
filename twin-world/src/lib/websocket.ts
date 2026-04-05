import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type MessageHandler = (payload: Record<string, unknown>) => void;

/**
 * Supabase Realtime を使った WebSocket 接続マネージャー。
 * ゲームセッション単位でチャネルを管理する。
 */
export class RealtimeManager {
  private channel: RealtimeChannel | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();

  /** チャネルに接続する */
  connect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.channel = supabase.channel(`game:${sessionId}`);

      this.channel
        .on("broadcast", { event: "*" }, ({ event, payload }) => {
          const eventHandlers = this.handlers.get(event);
          if (eventHandlers) {
            eventHandlers.forEach((handler) =>
              handler(payload as Record<string, unknown>)
            );
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            resolve();
          } else if (status === "CHANNEL_ERROR") {
            reject(new Error("Failed to subscribe to channel"));
          }
        });
    });
  }

  /** イベントを送信する */
  send(event: string, payload: Record<string, unknown>): void {
    if (!this.channel) {
      throw new Error("Not connected. Call connect() first.");
    }
    this.channel.send({ type: "broadcast", event, payload });
  }

  /** イベントリスナーを登録する */
  on(event: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // unsubscribe関数を返す
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  /** 接続を切断する */
  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.handlers.clear();
  }

  /** 接続状態を取得する */
  get isConnected(): boolean {
    return this.channel !== null;
  }
}

/** シングルトンインスタンス */
export const realtimeManager = new RealtimeManager();
