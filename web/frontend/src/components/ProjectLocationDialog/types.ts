export type MethodType =
  | "location_name"
  | "map"
  | "custom_data";

export interface WeatherData {
  wind_speed?: string | number;
  zone?: string;
  z_value?: string | number;
  max_temp?: string | number;
  min_temp?: string | number;
}

export interface LocationData {
  state?: string;
  district?: string;
  latitude?: string;
  longitude?: string;
}