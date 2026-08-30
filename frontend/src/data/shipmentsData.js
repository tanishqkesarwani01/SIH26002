// In-Transit Consignments and Fleet Telemetry across Northeast Strategic Corridors

export const INITIAL_SHIPMENTS = [
  {
    id: "SHP-MED-0914",
    title: "Liquid Medical Oxygen (LMO) Tanker #4",
    carrier: "National Health Mission / Indian Oil Cryogenic",
    vehicleNo: "AS-01-GB-4190",
    driverName: "Bipul Kalita",
    driverPhone: "+91 94350-12844",
    priority: "CRITICAL_MEDICAL", // CRITICAL_MEDICAL | PRIORITY_RELIEF | STANDARD_BULK
    priorityLabel: "Level 1: Critical Medical Lifeline",
    cargoType: "Cryogenic Oxygen (16,000 Ltrs)",
    temperature: "-183.2°C (Cryo Stable)",
    origin: "Guwahati IOCL Hub",
    destination: "Silchar Medical College & Hospital (SMCH)",
    corridorId: "nh-6-meghalaya-barak",
    corridorName: "NH-6 Meghalaya-Barak Corridor",
    currentLocationName: "Jowai Bypass (KM 92)",
    currentCoords: [25.4484, 92.2038],
    speedKmh: 42,
    etaMinutes: 210,
    etaOriginalMinutes: 210,
    status: "ON_PRIMARY_ROUTE", // ON_PRIMARY_ROUTE | REROUTED_ACTIVE | DELAYED_ALERT
    rerouteInfo: {
      alternateCorridorId: "nh-27-haflong-bypass",
      alternateCorridorName: "NH-27 East-West Expressway (via Haflong)",
      deltaDistanceKm: 48,
      deltaEtaMinutes: 55,
      safetyGainScore: "+76% Safer (Bypasses Sonapur Slide Zone)"
    },
    telemetry: {
      fuelLevel: 78,
      tirePressurePsi: 110,
      engineTempC: 84,
      gpsAccuracyM: 1.8,
      satelliteFix: "9 Birds Locked (NavIC)"
    }
  },
  {
    id: "SHP-VAC-1082",
    title: "Universal Immunization Vaccines & Antivenom",
    carrier: "Directorate of Health Services, Meghalaya",
    vehicleNo: "ML-05-AB-7721",
    driverName: "Daplin Khongwir",
    driverPhone: "+91 98630-49210",
    priority: "CRITICAL_MEDICAL",
    priorityLabel: "Level 1: Cold-Chain Bio-Supply",
    cargoType: "Deep Cold Vaccines (2-8°C)",
    temperature: "+3.8°C (Cold Chain Intact)",
    origin: "Guwahati Central Drug Store",
    destination: "Jowai District Civil Hospital",
    corridorId: "nh-6-meghalaya-barak",
    currentLocationName: "Nongpoh Valley (KM 48)",
    currentCoords: [25.9080, 91.8600],
    speedKmh: 48,
    etaMinutes: 75,
    etaOriginalMinutes: 75,
    status: "ON_PRIMARY_ROUTE",
    rerouteInfo: {
      alternateCorridorId: "nh-27-haflong-bypass",
      alternateCorridorName: "NH-27 / Umroi Link",
      deltaDistanceKm: 18,
      deltaEtaMinutes: 25,
      safetyGainScore: "+82% Stable"
    },
    telemetry: {
      fuelLevel: 85,
      tirePressurePsi: 95,
      engineTempC: 80,
      gpsAccuracyM: 2.1,
      satelliteFix: "8 Birds Locked (NavIC)"
    }
  },
  {
    id: "SHP-REL-3021",
    title: "NDRF Flood Relief Rations & Water Purifiers",
    carrier: "National Disaster Response Force (1st Bn NDRF)",
    vehicleNo: "WB-74-J-8812",
    driverName: "Rajen Chettri",
    driverPhone: "+91 97330-81992",
    priority: "PRIORITY_RELIEF",
    priorityLabel: "Level 2: Essential Disaster Relief",
    cargoType: "Ready-to-Eat Kits & Aqua-Tabs (12 MT)",
    temperature: "Ambient (24.0°C)",
    origin: "Siliguri Army Supply Depot",
    destination: "Gangtok Emergency Relief Hub",
    corridorId: "nh-10-sikkim-artery",
    corridorName: "NH-10 Sikkim Lifeline",
    currentLocationName: "Sevoke Coronation Gate",
    currentCoords: [26.8850, 88.4680],
    speedKmh: 36,
    etaMinutes: 140,
    etaOriginalMinutes: 140,
    status: "ON_PRIMARY_ROUTE",
    rerouteInfo: {
      alternateCorridorId: "lava-gorubathan-sikkim-bypass",
      alternateCorridorName: "Lava - Gorubathan - Reshi Corridor",
      deltaDistanceKm: 62,
      deltaEtaMinutes: 90,
      safetyGainScore: "+91% Flood-Resilient Hill Crest"
    },
    telemetry: {
      fuelLevel: 92,
      tirePressurePsi: 105,
      engineTempC: 82,
      gpsAccuracyM: 3.0,
      satelliteFix: "7 Birds Locked (NavIC)"
    }
  },
  {
    id: "SHP-FCI-4419",
    title: "FCI Essential Rice & Wheat Grains",
    carrier: "Food Corporation of India Freight Line",
    vehicleNo: "NL-01-K-3391",
    driverName: "Temsu Ao",
    driverPhone: "+91 94360-31290",
    priority: "PRIORITY_RELIEF",
    priorityLabel: "Level 2: Public Distribution Supply",
    cargoType: "Grain Sacks (24 MT Multi-Axle)",
    temperature: "Ambient (22.5°C)",
    origin: "Dimapur FCI Depot",
    destination: "Kohima Civil Supply Warehouse",
    corridorId: "nh-29-nagaland-corridor",
    corridorName: "NH-29 Nagaland Axis",
    currentLocationName: "Chumukedima Outskirts (KM 14)",
    currentCoords: [25.8200, 93.7500],
    speedKmh: 32,
    etaMinutes: 110,
    etaOriginalMinutes: 110,
    status: "ON_PRIMARY_ROUTE",
    rerouteInfo: {
      alternateCorridorId: "bokajan-woka-kohima-bypass",
      alternateCorridorName: "Bokajan - Wokha High Ridge Road",
      deltaDistanceKm: 75,
      deltaEtaMinutes: 105,
      safetyGainScore: "+68% Bypasses Chumukedima Slide"
    },
    telemetry: {
      fuelLevel: 64,
      tirePressurePsi: 112,
      engineTempC: 86,
      gpsAccuracyM: 2.5,
      satelliteFix: "9 Birds Locked (NavIC)"
    }
  },
  {
    id: "SHP-POL-8810",
    title: "Commercial Petroleum & HSD Bulk Tanker",
    carrier: "Numaligarh Refinery Transport Fleet",
    vehicleNo: "AS-03-CC-5109",
    driverName: "Dhiraj Saikia",
    driverPhone: "+91 98540-77123",
    priority: "STANDARD_BULK",
    priorityLabel: "Level 3: Commercial Petroleum",
    cargoType: "High Speed Diesel (20 KL)",
    temperature: "Ambient (26.0°C)",
    origin: "Numaligarh Refinery Terminal",
    destination: "Imphal POL Retail Depot",
    corridorId: "nh-29-nagaland-corridor",
    corridorName: "NH-29 Dimapur-Kohima-Imphal",
    currentLocationName: "Dabaka Junction (KM 42)",
    currentCoords: [26.1300, 92.8600],
    speedKmh: 52,
    etaMinutes: 340,
    etaOriginalMinutes: 340,
    status: "ON_PRIMARY_ROUTE",
    rerouteInfo: {
      alternateCorridorId: "silchar-jiribam-imphal-nh37",
      alternateCorridorName: "NH-37 Silchar-Jiribam Axis",
      deltaDistanceKm: 110,
      deltaEtaMinutes: 160,
      safetyGainScore: "+54% Open Paved Flow"
    },
    telemetry: {
      fuelLevel: 88,
      tirePressurePsi: 115,
      engineTempC: 85,
      gpsAccuracyM: 2.2,
      satelliteFix: "8 Birds Locked (NavIC)"
    }
  }
];
