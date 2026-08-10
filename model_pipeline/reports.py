import io
import time
import base64
from PIL import Image

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_pdf_report(prediction_data: dict, orig_pil_image: Image.Image = None) -> bytes:
    """
    Generates a professional PDF evaluation report from real inference results and image-derived proxies using ReportLab.
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
    
    PRIMARY_COLOR = colors.HexColor("#10B981")     # Emerald accent
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
            Paragraph("<b>TERRAINVISION AI</b><br/><font size=9 color='#64748B'>Smart India Hackathon Autonomous Terrain Analysis System</font>", title_style),
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

    # 2. Executive Classification Outcome Summary
    terrain_name = str(prediction_data.get('predicted_terrain', 'unknown')).upper()
    confidence = float(prediction_data.get('confidence', 0.0))
    conf_pct = f"{confidence * 100:.1f}%"
    is_unsupported = bool(prediction_data.get('unsupported_image', False))
    status_str = "REJECTED (OOD / UNKNOWN)" if is_unsupported else "VERIFIED TERRAIN"
    status_color = colors.HexColor("#EF4444") if is_unsupported else PRIMARY_COLOR

    summary_card_data = [
        [
            Paragraph("<b>CLASSIFICATION OUTCOME</b>", cell_normal),
            Paragraph("<b>MODEL CONFIDENCE</b>", cell_normal),
            Paragraph("<b>VERIFICATION STATUS</b>", cell_normal)
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

    # 3. Visual Evidence & AI Explainability
    elements.append(Paragraph("Visual Evidence & AI Explainability (Grad-CAM)", h2_style))
    
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
            gradcam_element = Paragraph("<font color='#64748B'><b>Grad-CAM Heatmap:</b><br/><i>Unavailable / Non-Terrain Rejection</i></font>", cell_normal)
    else:
        gradcam_element = Paragraph("<font color='#64748B'><b>Grad-CAM Heatmap:</b><br/><i>Unavailable / Non-Terrain Rejection</i></font>", cell_normal)

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

    # 4. Image-Derived Visual Terrain Indicators (Honest Proxies)
    analysis = prediction_data.get('analysis') or prediction_data.get('implicit_quantities') or {}
    elements.append(Paragraph("Image-Derived Visual Terrain Indicators", h2_style))

    prop_rows = [
        [Paragraph("<b>Indicator / Proxy</b>", cell_bold), Paragraph("<b>Calculated Value</b>", cell_bold), Paragraph("<b>Qualitative Visual Assessment</b>", cell_bold)]
    ]

    if analysis and not is_unsupported:
        rough = analysis.get('visual_roughness') or {}
        wet = analysis.get('visual_wetness') or {}
        stab = analysis.get('ground_stability') or {}

        prop_rows.extend([
            [Paragraph("Visual Roughness Index", cell_normal), Paragraph(f"{rough.get('index', 'N/A')} / 100", cell_normal), Paragraph(f"{rough.get('qualitative', 'N/A')}", cell_normal)],
            [Paragraph("Visual Wetness Indicator", cell_normal), Paragraph(f"{wet.get('index', 'N/A')} / 100", cell_normal), Paragraph(f"{wet.get('qualitative', 'N/A')}", cell_normal)],
            [Paragraph("Estimated Traction Potential", cell_normal), Paragraph(f"{analysis.get('traction_potential', 'N/A')} / 100", cell_normal), Paragraph("Heuristic traversability estimate", cell_normal)],
            [Paragraph("Visual Ground Stability", cell_normal), Paragraph(f"{stab.get('score', 'N/A')} / 100", cell_normal), Paragraph(f"{stab.get('status', 'N/A')}", cell_normal)],
            [Paragraph("Rover Safety Score", cell_normal), Paragraph(f"<font color='#10B981'><b>{analysis.get('rover_safety_score', 'N/A')} / 100</b></font>", cell_normal), Paragraph("Weighted visual safety heuristic", cell_normal)],
            [Paragraph("Hazard Rating", cell_normal), Paragraph(f"{analysis.get('hazard_rating', 'N/A')} / 5", cell_normal), Paragraph(", ".join(analysis.get('hazard_factors', [])[:2]), cell_normal)],
        ])
    else:
        prop_rows.append([
            Paragraph("Visual Telemetry", cell_normal),
            Paragraph("N/A", cell_normal),
            Paragraph("Image rejected or unclassified due to out-of-distribution or low confidence.", cell_normal)
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

    # 5. Traversability Recommendations
    elements.append(Paragraph("Autonomous Rover Traversal Recommendations", h2_style))

    recom_data = [
        [
            Paragraph("<b>Recommended Traversal Mode:</b>", cell_bold),
            Paragraph(f"<font color='#10B981'><b>{analysis.get('traversal_mode', 'N/A')}</b></font>", cell_normal),
            Paragraph("<b>Recommended Speed Range:</b>", cell_bold),
            Paragraph(f"{analysis.get('recommended_speed_range', 'N/A')}", cell_normal)
        ],
        [
            Paragraph("<b>Drive Profile:</b>", cell_bold),
            Paragraph(f"{analysis.get('drive_profile', 'N/A')}", cell_normal),
            Paragraph("<b>Rover Safety Score:</b>", cell_bold),
            Paragraph(f"{analysis.get('rover_safety_score', 'N/A')}/100", cell_normal)
        ]
    ]
    recom_table = Table(recom_data, colWidths=[150, 120, 140, 130])
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
        "<font size=8 color='#94A3B8'>TerrainVision AI • Smart India Hackathon Submission • Dynamically Generated Evaluation Report</font>",
        ParagraphStyle('Footer', parent=styles['Normal'], alignment=1)
    )
    elements.append(footer_text)

    doc.build(elements)
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()
