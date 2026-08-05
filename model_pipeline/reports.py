import io
import time
import base64
from PIL import Image

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_pdf_report(prediction_data: dict, orig_pil_image: Image.Image = None) -> bytes:
    """
    Generates a professional PDF report from REAL inference results using ReportLab.
    Returns PDF bytes.
    """
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab library is required for PDF generation. Install with 'pip install reportlab'.")

    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY_COLOR = colors.HexColor("#10B981")     # Emerald accent
    BG_DARK = colors.HexColor("#0F172A")           # Slate Dark
    TEXT_DARK = colors.HexColor("#1E293B")         # Body text
    MUTED_TEXT = colors.HexColor("#64748B")        # Subtitles
    CARD_BG = colors.HexColor("#F8FAFC")           # Light table background
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY_COLOR
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=MUTED_TEXT
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=TEXT_DARK,
        spaceBefore=12,
        spaceAfter=6
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=TEXT_DARK
    )

    cell_normal = ParagraphStyle(
        'CellNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=TEXT_DARK
    )

    elements = []

    report_id = int(time.time() * 1000) % 1000000
    # 1. Header & Branding
    header_data = [
        [
            Paragraph("<b>TERRAINVISION AI</b><br/><font size=9 color='#64748B'>Smart India Hackathon Autonomous Vision System</font>", title_style),
            Paragraph(f"<b>Report ID:</b> TV-{report_id}<br/><b>Date:</b> {prediction_data.get('timestamp', 'N/A')}<br/><b>Model:</b> {prediction_data.get('model_version', 'terrain-cnn-v1.2.0')}", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 220])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))

    # Divider Line
    elements.append(Table([['']], colWidths=[540], rowHeights=[2], style=TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PRIMARY_COLOR)
    ])))
    elements.append(Spacer(1, 12))

    # 2. Executive Assessment Summary
    terrain_name = prediction_data.get('predicted_terrain', 'Unknown').upper()
    confidence = prediction_data.get('confidence', 0.0)
    conf_pct = f"{confidence * 100:.1f}%"
    is_unsupported = prediction_data.get('unsupported_image', False)
    status_str = "REJECTED (LOW CONFIDENCE)" if is_unsupported else "VERIFIED CLASSIFICATION"
    status_color = colors.HexColor("#EF4444") if is_unsupported else PRIMARY_COLOR

    summary_card_data = [
        [
            Paragraph("<b>CLASSIFICATION RESULT</b>", cell_normal),
            Paragraph("<b>CONFIDENCE SCORE</b>", cell_normal),
            Paragraph("<b>ASSESSMENT STATUS</b>", cell_normal)
        ],
        [
            Paragraph(f"<font size=14 color='#10B981'><b>{terrain_name}</b></font>", cell_bold),
            Paragraph(f"<font size=14 color='#1E293B'><b>{conf_pct}</b></font>", cell_bold),
            Paragraph(f"<font size=11 color='{status_color.hexval()}'><b>{status_str}</b></font>", cell_bold)
        ]
    ]
    summary_table = Table(summary_card_data, colWidths=[180, 180, 180])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 14))

    # 3. Visual Telemetry (Original Image + Grad-CAM Explainability Overlay)
    elements.append(Paragraph("Visual Evidence & AI Explainability (Grad-CAM)", h2_style))
    
    if not prediction_data:
        prediction_data = {}

    orig_element = None
    if orig_pil_image:
        try:
            orig_buf = io.BytesIO()
            orig_pil_image.resize((220, 160)).save(orig_buf, format='PNG')
            orig_buf.seek(0)
            orig_element = RLImage(orig_buf, width=220, height=160)
        except Exception:
            orig_element = Paragraph("<i>Original input image preview unavailable</i>", cell_normal)
    else:
        orig_element = Paragraph("<i>Original input image preview unavailable</i>", cell_normal)

    gradcam_element = None
    gradcam_b64 = prediction_data.get('gradcam_base64')
    if gradcam_b64 and ',' in gradcam_b64:
        try:
            gradcam_bytes = base64.b64decode(gradcam_b64.split(',')[1].strip())
            gradcam_buf = io.BytesIO(gradcam_bytes)
            gradcam_element = RLImage(gradcam_buf, width=220, height=160)
        except Exception:
            gradcam_element = Paragraph("<font color='#64748B'><b>Grad-CAM Heatmap:</b><br/><i>Unavailable / Low Confidence Rejection</i></font>", cell_normal)
    else:
        gradcam_element = Paragraph("<font color='#64748B'><b>Grad-CAM Heatmap:</b><br/><i>Unavailable / Low Confidence Rejection</i></font>", cell_normal)

    vision_table_data = [
        [Paragraph("<b>Source Terrain Input Image</b>", cell_bold), Paragraph("<b>Grad-CAM Feature Attribution Heatmap</b>", cell_bold)],
        [orig_element, gradcam_element]
    ]
    vision_table = Table(vision_table_data, colWidths=[270, 270])
    vision_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(vision_table)
    elements.append(Spacer(1, 14))

    # 4. Physical Terrain Properties Table
    implicit = prediction_data.get('implicit_quantities') or {}
    elements.append(Paragraph("Terrain Geotechnical & Physical Properties", h2_style))

    prop_rows = [
        [Paragraph("<b>Property Metric</b>", cell_bold), Paragraph("<b>Value / Metric</b>", cell_bold), Paragraph("<b>Qualitative Description</b>", cell_bold)]
    ]

    if implicit:
        rough = implicit.get('roughness') or {}
        slip = implicit.get('slipperiness') or {}
        treach = implicit.get('treacherousness') or {}
        stab = implicit.get('surface_stability') or {}
        hydr = implicit.get('hydration') or {}
        veg = implicit.get('vegetation') or {}

        prop_rows.extend([
            [Paragraph("Surface Roughness (Ra)", cell_normal), Paragraph(f"{rough.get('value_ra', 'N/A')} µm", cell_normal), Paragraph(f"{rough.get('qualitative', 'N/A')} ({rough.get('description', '')})", cell_normal)],
            [Paragraph("Slipperiness Friction (µ)", cell_normal), Paragraph(f"{slip.get('friction_coefficient', 'N/A')}", cell_normal), Paragraph(f"{slip.get('qualitative', 'N/A')} ({slip.get('description', '')})", cell_normal)],
            [Paragraph("Treacherousness Level", cell_normal), Paragraph(f"Hazard Level {treach.get('hazard_level', 'N/A')}/5", cell_normal), Paragraph(f"{treach.get('qualitative', 'N/A')} ({treach.get('description', '')})", cell_normal)],
            [Paragraph("Bearing Capacity", cell_normal), Paragraph(f"{stab.get('bearing_capacity_kpa', 'N/A')} kPa", cell_normal), Paragraph(f"Status: {stab.get('status', 'N/A')}", cell_normal)],
            [Paragraph("Moisture & Hydration", cell_normal), Paragraph(f"{hydr.get('moisture_pct', 'N/A')}%", cell_normal), Paragraph(f"{hydr.get('qualitative', 'N/A')}", cell_normal)],
            [Paragraph("Vegetation Coverage", cell_normal), Paragraph(f"{veg.get('density_pct', 'N/A')}%", cell_normal), Paragraph(f"{veg.get('qualitative', 'N/A')}", cell_normal)],
        ])
    else:
        prop_rows.append([
            Paragraph("Physical Telemetry", cell_normal),
            Paragraph("N/A", cell_normal),
            Paragraph("Image rejected or unclassified due to low model confidence.", cell_normal)
        ])

    prop_table = Table(prop_rows, colWidths=[150, 120, 270])
    prop_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(prop_table)
    elements.append(Spacer(1, 14))

    # 5. Perception Telemetry & Traversal Recommendations
    elements.append(Paragraph("Autonomous Rover Traversal Telemetry", h2_style))
    telemetry = (implicit.get('perception_telemetry') if isinstance(implicit, dict) else {}) or {}

    recom_data = [
        [
            Paragraph("<b>Recommended Drive Mode:</b>", cell_bold),
            Paragraph(f"<font color='#10B981'><b>{telemetry.get('recommended_drive_mode', 'N/A')}</b></font>", cell_normal),
            Paragraph("<b>Max Safe Speed:</b>", cell_bold),
            Paragraph(f"{telemetry.get('recommended_max_speed_kmh', 'N/A')} km/h", cell_normal)
        ],
        [
            Paragraph("<b>Traversal Safety Index:</b>", cell_bold),
            Paragraph(f"{telemetry.get('traversal_safety_index', 'N/A')}/100", cell_normal),
            Paragraph("<b>Wheel Grip Index:</b>", cell_bold),
            Paragraph(f"{telemetry.get('wheel_grip_index', 'N/A')}/100", cell_normal)
        ]
    ]
    recom_table = Table(recom_data, colWidths=[140, 130, 140, 130])
    recom_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(recom_table)
    elements.append(Spacer(1, 16))

    # Footer Notice
    footer_text = Paragraph(
        "<font size=8 color='#94A3B8'>TerrainVision AI • Smart India Hackathon Submission • Verified Machine Learning Pipeline Output</font>",
        ParagraphStyle('Footer', parent=styles['Normal'], alignment=1)
    )
    elements.append(footer_text)

    doc.build(elements)
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()
