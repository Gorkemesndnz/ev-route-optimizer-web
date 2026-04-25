/** Standalone weather endpoint response (camelCase — no JsonPropertyName) */
export interface WeatherResponseDto {
  tempCelsius: number;
  description: string;
  iconCode: string;
}
