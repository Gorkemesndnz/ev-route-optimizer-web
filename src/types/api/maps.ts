// Autocomplete (snake_case via [JsonPropertyName] in backend)
export interface StructuredFormattingDto {
  main_text: string;
  secondary_text: string;
}

export interface AutocompletePredictionDto {
  description: string;
  place_id: string;
  structured_formatting: StructuredFormattingDto;
}

export interface AutocompleteResponseDto {
  predictions: AutocompletePredictionDto[];
  status: string;
}

// Place details + geocoding (camelCase default)
export interface PlaceDetailsDto {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface GeocodeResponseDto {
  formattedAddress: string;
  latitude: number;
  longitude: number;
}
