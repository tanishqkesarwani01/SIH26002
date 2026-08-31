"""
Script to generate an executive, publication-grade PDF Guide for
Northeast India Logistics Resilience Platform (NER-LRP).
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to add 'Page X of Y' and running headers/footers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "NER-LRP: AI & GIS Regional Logistics Control Tower")
            self.drawRightString(612 - 54, 750, "Technical & Operational Master Guide")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 612 - 54, 744)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        self.drawString(54, 32, "Confidential - Smart India Hackathon & MDoNER Logistics Initiative")
        self.drawRightString(612 - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="NER_Logistics_Resilience_Platform_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Dark Slate
    teal_color = colors.HexColor("#0d9488") # Deep Teal
    accent_emerald = colors.HexColor("#059669")
    dark_gray = colors.HexColor("#334155")
    light_bg = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=teal_color,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=teal_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_gray,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # Title Banner Block
    banner_data = [
        [
            Paragraph("<b>NORTHEAST INDIA LOGISTICS RESILIENCE PLATFORM (NER-LRP)</b>", title_style),
        ],
        [
            Paragraph("<b>AI & GIS-Driven Regional Logistics Control Tower for Northeast India</b><br/>"
                      "<font size=8.5 color='#64748b'>Real-Time Ingestion | Geospatial ML Risk Engine | Cargo Prioritization | Offline PWA | Multilingual Broadcast</font>", subtitle_style)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[504])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('PADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 8),
        ('LINEBELOW', (0,-1), (-1,-1), 2, teal_color),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 14))

    # SECTION 1: EXECUTIVE OVERVIEW
    story.append(Paragraph("1. Executive Overview & Problem Context", h1_style))
    story.append(Paragraph(
        "The Northeast Region (NER) of India is characterized by extremely steep mountainous topography (>70% hilly), "
        "heavy monsoon precipitation, frequent flash floods, landslides, and single-artery national highways "
        "(e.g., NH-10 into Sikkim, NH-6 through Meghalaya into Mizoram/Tripura, NH-29 into Nagaland). "
        "Disruptions frequently choke essential supply chains, inflating local commodity costs by <b>over 20%</b> and "
        "delaying life-saving pharmaceuticals and medical oxygen to remote district hospitals.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Solution:</b> NER-LRP establishes an end-to-end <b>Sense-Predict-Decide-Act</b> Control Tower combining "
        "live meteorological feeds (Open-Meteo & IMD APIs), NASA SRTM slope profiles, OpenStreetMap road topology, and "
        "Geological Survey of India (GSI) disaster records to compute explainable hazard scores, prioritize critical medical cargo, "
        "enable offline-first field incident reporting, and broadcast multilingual voice alerts across 6 regional languages.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # SECTION 2: DATA AUTHENTICITY & ARCHITECTURE
    story.append(Paragraph("2. Data Authenticity & Architecture Matrix", h1_style))
    
    matrix_data = [
        ["Layer / Component", "Data Provider / Technology", "Authenticity / Real-World Basis"],
        ["Live Weather Feeds", "Open-Meteo & IMD APIs", "100% Real-Time (Rainfall mm, 48h cumulative rain, wind speed, soil moisture)"],
        ["Mountain Slopes", "NASA SRTM Digital Elevation Model", "Real Slope Angles (e.g. 38.5° NH-10 Teesta, 36.5° NH-6 Sonapur Pass)"],
        ["Highway Topologies", "OpenStreetMap (OSM) Graph Engine", "Real Road Geometries across 8 Northeast States (4,820 KM monitored)"],
        ["Disaster Zones", "Geological Survey of India (GSI)", "Verified Historical Landslide Hotspots (Sonapur, 29th Mile, Chumukedima)"],
        ["AI Risk Scoring", "Scikit-Learn Gradient Boosting ML", "Trained ML Model with explainable factor contributions (0-100 score)"],
        ["Offline Field Sync", "IndexedDB & LocalStorage PWA", "Offline-First Local Queue with idempotent batch sync upon reconnect"],
        ["Voice Broadcaster", "Web Speech Synthesis API", "Live audible speech synthesis in 6 regional Northeast languages"]
    ]
    
    matrix_table = Table(
        [[Paragraph(f"<b>{c}</b>" if r==0 else c, body_style) for c in row] for r, row in enumerate(matrix_data)],
        colWidths=[120, 164, 220]
    )
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 12))

    # SECTION 3: FEATURE-BY-FEATURE DEEP DIVE
    story.append(Paragraph("3. Deep Dive into Every Feature & How to Use It", h1_style))

    # Feature 1
    story.append(Paragraph("Feature 1: Interactive GIS Command Tower Map", h2_style))
    story.append(Paragraph(
        "The central dashboard renders a high-performance Leaflet dark map of Northeast India with color-coded highway lines, "
        "weather radar precipitation overlays, and animated moving fleet markers.",
        body_style
    ))
    story.append(Paragraph("• <b>Basemap Style Selector:</b> Located in the top-right toolbar. Switch between <i>ESRI Dark Canvas</i>, <i>OpenStreetMap Detailed</i>, and <i>ESRI Satellite Terrain</i> (100% free with zero watermarks).", bullet_style))
    story.append(Paragraph("• <b>Color Status Coding:</b> Green (Safe, <35% risk), Yellow (Watch, 36-60%), Orange (Warning, 61-80%), Red (Blocked, >80% risk / active landslide), and Dashed Emerald (Dynamic AI Alternate Bypass).", bullet_style))
    story.append(Paragraph("• <b>Interactive Inspection:</b> Click on any highway line to open the AI Risk Explainability drawer, or click any truck icon to inspect CAN-bus telemetry, speed, and cold-chain temperature.", bullet_style))

    # Feature 2
    story.append(Paragraph("Feature 2: 1-Click Disruption Simulator", h2_style))
    story.append(Paragraph(
        "Demonstrates real-time system reaction to sudden disasters without having to wait for a real-world landslide during evaluation.",
        body_style
    ))
    story.append(Paragraph("• <b>Scenario 1 (NH-6 Sonapur Landslide):</b> Triggers 3,800m³ hill collapse -> NH-6 turns RED -> System intercepts Medical Oxygen Convoy NER-MED-8910 and diverts via NH-27 Haflong bypass (+55m ETA, +76% safety factor).", bullet_style))
    story.append(Paragraph("• <b>Scenario 2 (NH-10 Kalijhora Flash Flood):</b> Teesta overtopping blocks Sikkim highway -> NDRF relief diverted via Lava-Gorubathan ridge (+90m ETA).", bullet_style))
    story.append(Paragraph("• <b>Scenario 3 (NH-29 Chumukedima Mudslide):</b> Mudflow restricts Nagaland lifeline -> Food grain fleet diverted via Bokajan-Wokha ridge (+105m ETA).", bullet_style))
    story.append(Paragraph("• <b>Scenario 4 (48h Monsoon Inundation):</b> Simulates regional 180-250mm downpour escalating hazard scores across all 7 state gateways.", bullet_style))
    story.append(Paragraph("• <b>Reset Button:</b> Instantly normalizes all corridors back to live meteorological monitoring baseline.", bullet_style))

    # Feature 3
    story.append(Paragraph("Feature 3: Cargo Fleet Prioritization & Telemetry", h2_style))
    story.append(Paragraph(
        "Unlike standard GPS apps that treat all vehicles equally, NER-LRP enforces multi-tier cargo criticality weights:",
        body_style
    ))
    story.append(Paragraph("• <b>Priority 1 (Critical Medical):</b> 85% Safety Weight / 15% Travel Time. Prioritizes life-support supplies, taking detours to bypass high-risk zones.", bullet_style))
    story.append(Paragraph("• <b>Priority 2 (Disaster Relief):</b> 60% Safety Weight / 40% Travel Time. Balanced optimization for rations and water purification units.", bullet_style))
    story.append(Paragraph("• <b>Priority 3 (Commercial Bulk):</b> 25% Safety Weight / 75% Travel Time. Optimizes for lowest transit time unless road is physically blocked.", bullet_style))

    story.append(PageBreak()) # Clean page break for field reporting, multilingual, and demo script

    # Feature 4
    story.append(Paragraph("Feature 4: Offline-First Field Officer PWA", h2_style))
    story.append(Paragraph(
        "Engineered for patrol officers and Border Roads Organisation (BRO) personnel in remote valleys with zero cellular reception:",
        body_style
    ))
    story.append(Paragraph("• <b>Offline Queue:</b> When offline, reports (photo, GPS coordinate lock, severity rating 1-10) save locally to IndexedDB with <b>⏳ Sync Pending</b> status.", bullet_style))
    story.append(Paragraph("• <b>Automatic Batch Sync:</b> Upon entering cellular range, the app automatically batch-syncs to the FastAPI backend, transitions status to <b>🟢 Synced</b>, and drops a pulsating incident marker on the central Command Tower map.", bullet_style))

    # Feature 5
    story.append(Paragraph("Feature 5: Multilingual Alert Hub & Voice Broadcaster", h2_style))
    story.append(Paragraph(
        "Translates emergency road advisories into 6 Northeast regional languages: <b>English, Hindi, Assamese (অসমীয়া), Mizo (Mizo ṭawng), Manipuri (মৈতৈলোন্), and Bengali (বাংলা)</b>.",
        body_style
    ))
    story.append(Paragraph("• <b>Audible Speech Synthesis:</b> Click <b>🔊 Listen Audio</b> to hear the warning spoken aloud in the selected regional language.", bullet_style))
    story.append(Paragraph("• <b>Driver Dispatch Payloads:</b> Generates pre-formatted WhatsApp and GSM-7 SMS messages ready to dispatch to en-route drivers.", bullet_style))

    # Feature 6
    story.append(Paragraph("Feature 6: Explainable AI (XAI) Risk Factor Drawer", h2_style))
    story.append(Paragraph(
        "Eliminates 'black box' AI by providing mathematical factor attribution for every hazard score: "
        "e.g. <i>96/100 Risk = 48h Rain (310mm) [42%] + Slope (36.5°) [32%] + GSI Hotspot [18%] + Active Reports [8%]</i>.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # SECTION 4: DEMO SCRIPT
    story.append(Paragraph("4. Step-by-Step 3-Minute Hackathon Demo Script", h1_style))
    
    script_box = [
        [Paragraph("<b>[0:00 - 0:30] Hook:</b> 'Over 70% of Northeast India is mountainous with single-artery lifelines. When landslides strike NH-6 or NH-10, life-saving medicines are blocked and local food prices jump 20%. Today we present NER-LRP—an AI and GIS-driven Control Tower.'", callout_style)],
        [Paragraph("<b>[0:30 - 1:15] GIS Tower:</b> 'Our system connects live to Open-Meteo weather APIs and NASA SRTM slope profiles across 4,820 km of Northeast corridors. Every highway on this dark GIS map is dynamically color-coded by our Gradient Boosting ML model.'", callout_style)],
        [Paragraph("<b>[1:15 - 2:00] Simulation:</b> 'Let's trigger a landslide at NH-6 Sonapur Tunnel. [Click button]. NH-6 turns RED. Unlike Google Maps, our system intercepts Convoy NER-MED-8910 carrying Emergency Oxygen and reroutes it via the NH-27 Haflong bypass (+55m delay).' ", callout_style)],
        [Paragraph("<b>[2:00 - 2:35] Offline PWA:</b> 'In zero-internet valleys, our Offline PWA allows patrol officers to submit photo damage reports. [Toggle Offline ON -> Submit -> Toggle Offline OFF]. Notice how it auto-syncs the moment connectivity is restored.'", callout_style)],
        [Paragraph("<b>[2:35 - 3:00] Multilingual:</b> 'Finally, we broadcast advisories in 6 regional languages [Click Assamese -> Listen Audio] so drivers receive voice alerts hands-free. Thank you!'", callout_style)],
    ]
    script_table = Table(script_box, colWidths=[504])
    script_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('LINELEFT', (0,0), (0,-1), 3, teal_color),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(script_table)
    story.append(Spacer(1, 10))

    # SECTION 5: JUDGE Q&A DEFENSE
    story.append(Paragraph("5. Judge Q&A Stress-Test Defense", h1_style))
    story.append(Paragraph("<b>Q: Why can't authorities just use Google Maps?</b><br/>"
                           "<b>A:</b> Google Maps is a consumer navigation app; it does not predict landslides from rainfall/slope data before they occur, does not prioritize critical medicine over cement, and lacks offline field reporting and regional multilingual audio broadcasting.", body_style))
    story.append(Paragraph("<b>Q: What data is real vs simulated?</b><br/>"
                           "<b>A:</b> Weather feeds (Open-Meteo API), mountain slopes (SRTM DEM), road geometry (OpenStreetMap), and landslide history (GSI) are 100% real. As stated in the Problem Statement, truck telematics and test disaster triggers are simulated for live evaluation demonstrations.", body_style))
    story.append(Paragraph("<b>Q: Why use Machine Learning instead of IF/ELSE rules?</b><br/>"
                           "<b>A:</b> Landslides depend on non-linear relationships between 48h cumulative rain, rain intensity, slope angle, and soil saturation. Gradient Boosting learns these multi-factor patterns and provides explainable factor weightings for every highway.", body_style))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF successfully generated at: {filename}")


if __name__ == "__main__":
    build_pdf()
