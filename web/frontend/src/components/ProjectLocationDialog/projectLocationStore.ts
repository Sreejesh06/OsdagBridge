import { create } from "zustand";
import type {
    MethodType,
    WeatherData,
    LocationData,
  } from "./types";

interface StoreState {
  customWeatherData: WeatherData | null;
  weatherData: WeatherData | null;

  locationMethod: MethodType | null;

  locationData: LocationData | null;

  setCustomWeatherData: (d: WeatherData | null) => void;
  setWeatherData: (d: WeatherData | null) => void;

  setLocationMethod: (m: MethodType | null) => void;
  setLocationData: (d: LocationData | null) => void;
}

export const useProjectLocationStore =
  create<StoreState>((set) => ({
    customWeatherData: null,
    weatherData: null,

    locationMethod: null,
    locationData: null,

    setCustomWeatherData: (d) =>
      set({ customWeatherData: d }),

    setWeatherData: (d) =>
      set({ weatherData: d }),

    setLocationMethod: (m) =>
      set({ locationMethod: m }),

    setLocationData: (d) =>
      set({ locationData: d }),
  }));