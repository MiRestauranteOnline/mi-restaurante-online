export interface Country {
  code: string;
  name: string;
  flag: string;
  locale: string;
}

export const countries: Country[] = [
  { code: "PE", name: "Perú", flag: "🇵🇪", locale: "es-PE" },
  { code: "US", name: "United States", flag: "🇺🇸", locale: "en-US" },
  { code: "MX", name: "México", flag: "🇲🇽", locale: "es-MX" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", locale: "es-CO" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", locale: "es-AR" },
  { code: "CL", name: "Chile", flag: "🇨🇱", locale: "es-CL" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", locale: "es-EC" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", locale: "es-BO" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", locale: "es-VE" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", locale: "pt-BR" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", locale: "es-UY" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", locale: "es-PY" },
  { code: "ES", name: "España", flag: "🇪🇸", locale: "es-ES" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", locale: "en-GB" },
  { code: "FR", name: "France", flag: "🇫🇷", locale: "fr-FR" },
  { code: "DE", name: "Germany", flag: "🇩🇪", locale: "de-DE" },
  { code: "IT", name: "Italy", flag: "🇮🇹", locale: "it-IT" },
  { code: "CA", name: "Canada", flag: "🇨🇦", locale: "en-CA" },
];
