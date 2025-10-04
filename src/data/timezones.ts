export interface Timezone {
  value: string;
  label: string;
  offset: string;
}

export const timezones: Timezone[] = [
  // Americas
  { value: "America/Lima", label: "Lima (UTC-5)", offset: "UTC-5" },
  { value: "America/New_York", label: "New York (UTC-5/UTC-4)", offset: "UTC-5" },
  { value: "America/Chicago", label: "Chicago (UTC-6/UTC-5)", offset: "UTC-6" },
  { value: "America/Denver", label: "Denver (UTC-7/UTC-6)", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/UTC-7)", offset: "UTC-8" },
  { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)", offset: "UTC-6" },
  { value: "America/Bogota", label: "Bogotá (UTC-5)", offset: "UTC-5" },
  { value: "America/Caracas", label: "Caracas (UTC-4)", offset: "UTC-4" },
  { value: "America/Santiago", label: "Santiago (UTC-4/UTC-3)", offset: "UTC-4" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (UTC-3)", offset: "UTC-3" },
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)", offset: "UTC-3" },
  { value: "America/Montevideo", label: "Montevideo (UTC-3)", offset: "UTC-3" },
  { value: "America/La_Paz", label: "La Paz (UTC-4)", offset: "UTC-4" },
  { value: "America/Guayaquil", label: "Guayaquil (UTC-5)", offset: "UTC-5" },
  { value: "America/Asuncion", label: "Asunción (UTC-4/UTC-3)", offset: "UTC-4" },
  
  // Europe
  { value: "Europe/Madrid", label: "Madrid (UTC+1/UTC+2)", offset: "UTC+1" },
  { value: "Europe/London", label: "London (UTC+0/UTC+1)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (UTC+1/UTC+2)", offset: "UTC+1" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/UTC+2)", offset: "UTC+1" },
  { value: "Europe/Rome", label: "Rome (UTC+1/UTC+2)", offset: "UTC+1" },
  
  // Others
  { value: "UTC", label: "UTC (UTC+0)", offset: "UTC+0" },
];
