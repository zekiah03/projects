/** Supabase Database type definitions for TWIN WORLD */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      game_data: {
        Row: {
          id: string;
          user_id: string;
          data_type: string;
          payload: Record<string, unknown>;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          data_type: string;
          payload: Record<string, unknown>;
          version?: number;
        };
        Update: {
          data_type?: string;
          payload?: Record<string, unknown>;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "game_data_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      game_sessions: {
        Row: {
          id: string;
          host_user_id: string;
          status: "waiting" | "active" | "finished";
          max_players: number;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_user_id: string;
          status?: "waiting" | "active" | "finished";
          max_players?: number;
          metadata?: Record<string, unknown>;
        };
        Update: {
          status?: "waiting" | "active" | "finished";
          max_players?: number;
          metadata?: Record<string, unknown>;
        };
        Relationships: [
          {
            foreignKeyName: "game_sessions_host_user_id_fkey";
            columns: ["host_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      session_players: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
        };
        Update: {
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_players_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "game_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
