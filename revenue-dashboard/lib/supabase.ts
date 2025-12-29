export type Revenue = {
  id: string;
  data: string;
  biliardi: number;
  bowling_time: number;
  bowling_game: number;
  bar: number;
  calcetto: number;
  video_games: number;
  created_at: string;
  weather_temperature?: number;
  weather_description?: string;
  weather_icon?: string;
};

export type RevenueInsert = Omit<Revenue, "id" | "created_at">;
export type RevenueUpdate = Partial<RevenueInsert>;
