// Real-time meteorological telemetry & radar precipitation hotspots across Northeast India

export const WEATHER_HOTSPOTS = [
  {
    id: "radar-cherrapunji",
    name: "Cherrapunji-Sohra / Mawsynram Plume",
    district: "East Khasi Hills, Meghalaya",
    lat: 25.2700,
    lng: 91.7300,
    radius: 38000, // meters
    intensity: "Extreme Monsoon Torrential",
    rainfall24h: 248.5, // mm
    rainfall48h: 462.0,
    landslideRisk: 92,
    color: "#ef4444", // Crimson
    windSpeedKmh: 42,
    temperatureC: 18.5,
    humidity: 98,
    imdAlert: "RED FLASH FLOOD & DEBRIS ALERT"
  },
  {
    id: "radar-sonapur-jaintia",
    name: "Sonapur Ridge & Jaintia Pass",
    district: "East Jaintia Hills, Meghalaya",
    lat: 25.1167,
    lng: 92.3556,
    radius: 28000,
    intensity: "Severe Heavy Downpour",
    rainfall24h: 184.2,
    rainfall48h: 310.8,
    landslideRisk: 88,
    color: "#f97316", // Orange
    windSpeedKmh: 36,
    temperatureC: 21.0,
    humidity: 95,
    imdAlert: "ORANGE ACTIVE LANDSLIDE WATCH"
  },
  {
    id: "radar-kalijhora-teesta",
    name: "Teesta Gorge & Kalijhora Surcharge",
    district: "Kalimpong / Darjeeling Foothills",
    lat: 26.9292,
    lng: 88.4697,
    radius: 25000,
    intensity: "Very Heavy Rainfall & River Surge",
    rainfall24h: 165.0,
    rainfall48h: 290.4,
    landslideRisk: 86,
    color: "#ef4444",
    windSpeedKmh: 28,
    temperatureC: 22.4,
    humidity: 96,
    imdAlert: "RED TEESTA RIVER WATER INUNDATION"
  },
  {
    id: "radar-chumukedima-nagaland",
    name: "Chumukedima-Kohima Escarpment",
    district: "Chumukedima, Nagaland",
    lat: 25.7950,
    lng: 93.7750,
    radius: 24000,
    intensity: "Heavy Continuous Downpour",
    rainfall24h: 118.0,
    rainfall48h: 198.5,
    landslideRisk: 79,
    color: "#f59e0b", // Amber
    windSpeedKmh: 22,
    temperatureC: 20.8,
    humidity: 91,
    imdAlert: "AMBER MUDFLOW ADVISORY"
  },
  {
    id: "radar-pasighat-siang",
    name: "Pasighat & Lower Siang Basin",
    district: "East Siang, Arunachal Pradesh",
    lat: 28.0667,
    lng: 95.3333,
    radius: 30000,
    intensity: "Active Rain Squalls",
    rainfall24h: 92.4,
    rainfall48h: 148.0,
    landslideRisk: 64,
    color: "#06b6d4", // Cyan
    windSpeedKmh: 30,
    temperatureC: 24.2,
    humidity: 89,
    imdAlert: "YELLOW FOOTHILL RUNOFF ALERT"
  }
];
