// High-precision geographic polylines and metadata for key Northeast India Strategic Corridors

export const NER_CORRIDORS = [
  {
    id: "nh-6-meghalaya-barak",
    name: "NH-6: Guwahati-Shillong-Silchar-Agartala Lifeline",
    code: "NH-6",
    states: ["Assam", "Meghalaya", "Tripura"],
    lengthKm: 485,
    criticality: "High (Lifeline for 3 States)",
    status: "safe", // safe, watch, warning, blocked
    riskScore: 24, // 0-100
    chokepoints: [
      { name: "Sonapur Tunnel & Hills", chainage: "KM 141.2", lat: 25.1167, lng: 92.3556, risk: "High Landslide Vulnerability" },
      { name: "Ratacherra Border Pass", chainage: "KM 178.0", lat: 24.9600, lng: 92.4200, risk: "Mudflow / Mudslide" },
      { name: "Khliehriat Coal Belt", chainage: "KM 115.4", lat: 25.3562, lng: 92.3683, risk: "Road Subsidence" }
    ],
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [25.9080, 91.8600], // Nongpoh
      [25.5788, 91.8933], // Shillong
      [25.4484, 92.2038], // Jowai
      [25.3562, 92.3683], // Khliehriat
      [25.1167, 92.3556], // Sonapur (Landslide Hotspot)
      [24.9600, 92.4200], // Ratacherra
      [24.8333, 92.7789], // Silchar (Barak Valley)
      [24.8667, 92.3500], // Karimganj
      [24.3833, 92.1667], // Dharmanagar
      [23.8315, 91.2868]  // Agartala
    ],
    alternateRouteId: "nh-27-haflong-bypass",
    explanation: {
      rainfall48h: 112,
      slopeAngle: 42.5,
      soilMoisture: 78,
      susceptibility: "Extreme High (GSI Zone V)",
      shapFactors: [
        { name: "48h Rain Intensity", value: 38, positive: true },
        { name: "Steep Cut-Slope Angle (>40°)", value: 32, positive: true },
        { name: "Overburden Sandstone Saturation", value: 22, positive: true },
        { name: "Heavy Multi-axle Freight Load", value: 8, positive: true }
      ]
    }
  },
  {
    id: "nh-10-sikkim-artery",
    name: "NH-10: Siliguri-Sevoke-Kalijhora-Gangtok Artery",
    code: "NH-10",
    states: ["West Bengal", "Sikkim"],
    lengthKm: 115,
    criticality: "Critical (Sole Highway to Sikkim)",
    status: "safe",
    riskScore: 28,
    chokepoints: [
      { name: "Kalijhora Teesta Gorge", chainage: "KM 26.5", lat: 26.9292, lng: 88.4697, risk: "Flash Flood / Teesta Inundation" },
      { name: "Birik Dara Slide Zone", chainage: "KM 34.0", lat: 26.9600, lng: 88.4800, risk: "Active Debris Slope" },
      { name: "29th Mile Chokepoint", chainage: "KM 46.0", lat: 27.0500, lng: 88.4900, risk: "Severe Mudflow" }
    ],
    coordinates: [
      [26.7271, 88.3953], // Siliguri
      [26.8850, 88.4680], // Sevoke Coronation Bridge
      [26.9292, 88.4697], // Kalijhora
      [26.9600, 88.4800], // Birik Dara
      [27.0500, 88.4900], // 29th Mile
      [27.1400, 88.5100], // Rangpo (Sikkim Border Checkpoint)
      [27.2300, 88.5000], // Singtam
      [27.3389, 88.6065]  // Gangtok
    ],
    alternateRouteId: "lava-gorubathan-sikkim-bypass",
    explanation: {
      rainfall48h: 145,
      slopeAngle: 48.0,
      soilMoisture: 84,
      susceptibility: "Very High (Teesta Basin Fault)",
      shapFactors: [
        { name: "Teesta River Level Surcharge", value: 44, positive: true },
        { name: "Fragile Schist/Phyllite Bedrock", value: 30, positive: true },
        { name: "Monsoon Toe-cutting", value: 16, positive: true },
        { name: "Drainage Choke", value: 10, positive: true }
      ]
    }
  },
  {
    id: "nh-29-nagaland-corridor",
    name: "NH-29: Dabaka-Dimapur-Chumukedima-Kohima-Mao",
    code: "NH-29",
    states: ["Assam", "Nagaland", "Manipur"],
    lengthKm: 210,
    criticality: "High (Nagaland & Manipur Lifeline)",
    status: "safe",
    riskScore: 22,
    chokepoints: [
      { name: "Chumukedima Old Bridge & Gorge", chainage: "KM 82.3", lat: 25.7950, lng: 93.7750, risk: "Deep Slope Mudslide & Rockfall" },
      { name: "Phesama Slide Zone", chainage: "KM 122.0", lat: 25.6200, lng: 94.1000, risk: "Road Sinking" },
      { name: "Piphema Sinking Zone", chainage: "KM 98.4", lat: 25.7400, lng: 93.9200, risk: "Subsidence" }
    ],
    coordinates: [
      [26.1300, 92.8600], // Dabaka (Assam)
      [25.9068, 93.7271], // Dimapur
      [25.7950, 93.7750], // Chumukedima
      [25.7400, 93.9200], // Piphema
      [25.6747, 94.1106], // Kohima
      [25.6200, 94.1000], // Phesama
      [25.5100, 94.1400], // Mao Border Gate
      [24.8170, 93.9368]  // Imphal link
    ],
    alternateRouteId: "bokajan-woka-kohima-bypass",
    explanation: {
      rainfall48h: 95,
      slopeAngle: 39.0,
      soilMoisture: 72,
      susceptibility: "High (Disang Shale Formation)",
      shapFactors: [
        { name: "Unconsolidated Clay/Shale", value: 36, positive: true },
        { name: "High Seepage Pressure", value: 28, positive: true },
        { name: "Continuous Heavy Showers", value: 24, positive: true },
        { name: "Hill Slope Cutting", value: 12, positive: true }
      ]
    }
  },
  {
    id: "nh-27-haflong-bypass",
    name: "NH-27: Guwahati-Lumding-Haflong-Silchar (East-West Corridor)",
    code: "NH-27 / EW",
    states: ["Assam"],
    lengthKm: 340,
    criticality: "Strategic Alternate Bypass",
    status: "safe",
    riskScore: 16,
    isAlternate: true,
    chokepoints: [
      { name: "Jatinga Valley Bridge", chainage: "KM 215.0", lat: 25.1200, lng: 93.0300, risk: "Moderate Slope Runoff" }
    ],
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.1300, 92.8600], // Dabaka
      [25.7500, 93.1700], // Lumding
      [25.1700, 93.0200], // Haflong / Dima Hasao
      [25.1200, 93.0300], // Jatinga
      [24.8333, 92.7789]  // Silchar
    ],
    explanation: {
      rainfall48h: 58,
      slopeAngle: 28.0,
      soilMoisture: 45,
      susceptibility: "Moderate (Engineered Expressway Sections)",
      shapFactors: [
        { name: "Engineered Culvert Discharge", value: 20, positive: false },
        { name: "Lower Elevation Gradient", value: 25, positive: false },
        { name: "Retaining Wall Reinforcement", value: 30, positive: false }
      ]
    }
  },
  {
    id: "nh-37-upper-assam",
    name: "NH-37: Kaziranga-Jorhat-Dibrugarh-Tinsukia Energy Corridor",
    code: "NH-37",
    states: ["Assam", "Arunachal Pradesh"],
    lengthKm: 390,
    criticality: "High (Tea, Petroleum & Defence Axis)",
    status: "safe",
    riskScore: 18,
    chokepoints: [
      { name: "Kaziranga Flood Bypass", chainage: "KM 190.0", lat: 26.5800, lng: 93.4100, risk: "Brahmaputra High Water Inundation" }
    ],
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.3500, 92.6800], // Nagaon
      [26.5800, 93.4100], // Kaziranga
      [26.7500, 94.2200], // Jorhat
      [27.4728, 94.9120], // Dibrugarh
      [27.5000, 95.3600], // Tinsukia
      [27.5800, 95.6600]  // Doomdooma / Roing gateway
    ],
    explanation: {
      rainfall48h: 82,
      slopeAngle: 12.0,
      soilMoisture: 60,
      susceptibility: "Low Landslide, Seasonal Flood Warning",
      shapFactors: [
        { name: "Brahmaputra Basin Water Level", value: 40, positive: true },
        { name: "Flat Alluvial Plain", value: 35, positive: false }
      ]
    }
  },
  {
    id: "nh-15-arunachal-foothills",
    name: "NH-15/52: Tezpur-North Lakhimpur-Pasighat Corridor",
    code: "NH-15",
    states: ["Assam", "Arunachal Pradesh"],
    lengthKm: 360,
    criticality: "Strategic Defence & Border Trade",
    status: "safe",
    riskScore: 21,
    chokepoints: [
      { name: "Ranganadi River Causeway", chainage: "KM 145.0", lat: 27.2400, lng: 94.0600, risk: "Flash Runoff" },
      { name: "Pasighat Siang Foothill", chainage: "KM 310.0", lat: 28.0667, lng: 95.3333, risk: "Himalayan Scree Debris" }
    ],
    coordinates: [
      [26.6338, 92.7926], // Tezpur
      [26.8500, 93.6300], // Biswanath Chariali
      [27.2400, 94.0600], // North Lakhimpur
      [27.4800, 94.5800], // Dhemaji
      [27.7800, 95.0500], // Jonai (Assam/Arunachal border)
      [28.0667, 95.3333]  // Pasighat
    ],
    explanation: {
      rainfall48h: 90,
      slopeAngle: 34.0,
      soilMoisture: 65,
      susceptibility: "Moderate to High near Eastern Himalayas",
      shapFactors: [
        { name: "Trans-Himalayan River Spillage", value: 32, positive: true },
        { name: "Gravel-Sand Fan Instability", value: 28, positive: true }
      ]
    }
  },
  {
    id: "nh-102-imphal-moreh",
    name: "NH-102: Imphal-Thoubal-Kakching-Moreh Asian Highway-1",
    code: "NH-102",
    states: ["Manipur"],
    lengthKm: 110,
    criticality: "International Trade & Border Logistics",
    status: "safe",
    riskScore: 19,
    chokepoints: [
      { name: "Tengnoupal Hill Crest", chainage: "KM 68.0", lat: 24.3800, lng: 94.1500, risk: "Monsoon Slip" }
    ],
    coordinates: [
      [24.8170, 93.9368], // Imphal
      [24.6400, 93.9900], // Thoubal
      [24.4800, 93.9800], // Kakching
      [24.3800, 94.1500], // Tengnoupal
      [24.2400, 94.3000]  // Moreh (Border with Myanmar)
    ],
    explanation: {
      rainfall48h: 64,
      slopeAngle: 29.0,
      soilMoisture: 52,
      susceptibility: "Moderate (Manipur Hills)",
      shapFactors: [
        { name: "Hillside Slit Formation", value: 25, positive: true },
        { name: "Moderate Rainfall Index", value: 20, positive: true }
      ]
    }
  }
];

// Helper to calculate total corridor km
export const TOTAL_CORRIDOR_KM = NER_CORRIDORS.reduce((acc, curr) => acc + curr.lengthKm, 0);
