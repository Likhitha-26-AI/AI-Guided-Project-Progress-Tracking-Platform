"""
Turns a completed agent pipeline into downloadable deliverables:
a Word synopsis/report and a PowerPoint slide deck. Both are built
entirely from the project's real agent outputs in the DB — nothing
hardcoded or templated with placeholder text.

Note: docx/pptx are imported lazily inside each function rather than at
module load time. Some Windows security policies (Smart App Control)
block the native lxml library these depend on — importing lazily means
that only breaks report/slide downloads specifically, not the whole
backend on startup.
"""
import os

OUTPUT_DIR = "generated_docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SECTION_ORDER = [
    ("idea_evaluation", "Idea Evaluation"),
    ("scope", "Scope Definition"),
    ("tech", "Technology Recommendation"),
    ("timeline", "Timeline Plan"),
    ("risk", "Risk Assessment"),
]


def _agent_map(project) -> dict:
    return {run.agent_key: run.output_text or "" for run in project.agent_runs}


def generate_report_docx(project) -> str:
    from docx import Document

    outputs = _agent_map(project)
    doc = Document()

    doc.add_heading(project.title, level=0)
    doc.add_paragraph(f"Project Synopsis & Report")

    for key, heading in SECTION_ORDER:
        doc.add_heading(heading, level=1)
        doc.add_paragraph(outputs.get(key, "") or "Not yet generated.")

    path = os.path.join(OUTPUT_DIR, f"{project.id}_report.docx")
    doc.save(path)
    return path


async def _bulletize(text: str) -> list:
    """Compresses a section's prose into short, punchy slide bullets using
    the same free HF model everything else uses — keeps the deck readable
    instead of dumping full paragraphs onto a slide."""
    from app.services.hf_client import generate

    if not text.strip():
        return ["Not yet generated."]

    prompt = (
        "Convert this into 4-6 short, punchy presentation bullet points, each under "
        "12 words, plain text only, one per line, no numbering or dashes:\n\n" + text
    )
    try:
        result = await generate(prompt, max_new_tokens=200, temperature=0.4)
        bullets = [line.strip("-•* ").strip() for line in result.split("\n") if line.strip()]
        return bullets[:6] if bullets else [text[:150]]
    except RuntimeError:
        # Fall back to naively splitting the raw text into lines if the AI call fails.
        lines = [l.strip("-•* ").strip() for l in text.split("\n") if l.strip()]
        return lines[:6] if lines else [text[:150]]


async def generate_slides_pptx(project) -> str:
    from pptx import Presentation
    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN

    PERIWINKLE = RGBColor(0x7B, 0x83, 0xC4)
    PERIWINKLE_LIGHT = RGBColor(0xF1, 0xF1, 0xFA)
    SAGE = RGBColor(0x7F, 0xBF, 0x9E)
    INK = RGBColor(0x2E, 0x2B, 0x3D)
    INK_SOFT = RGBColor(0x5B, 0x57, 0x70)
    WHITE = RGBColor(0xFF, 0xFF, 0xFF)

    outputs = _agent_map(project)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def fill_bg(slide, color):
        rect = slide.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
        rect.fill.solid()
        rect.fill.fore_color.rgb = color
        rect.line.fill.background()
        slide.shapes._spTree.remove(rect._element)
        slide.shapes._spTree.insert(2, rect._element)
        return rect

    # --- Title slide ---
    slide = prs.slides.add_slide(blank_layout)
    fill_bg(slide, PERIWINKLE_LIGHT)
    accent = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(0.25), prs.slide_height)
    accent.fill.solid()
    accent.fill.fore_color.rgb = PERIWINKLE
    accent.line.fill.background()

    tb = slide.shapes.add_textbox(Inches(1), Inches(2.7), Inches(11), Inches(1.6))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.text = project.title
    tf.paragraphs[0].font.size = Pt(42)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = INK

    sub = slide.shapes.add_textbox(Inches(1), Inches(3.9), Inches(11), Inches(0.6))
    sub.text_frame.text = "Project Blueprint"
    sub.text_frame.paragraphs[0].font.size = Pt(20)
    sub.text_frame.paragraphs[0].font.color.rgb = PERIWINKLE

    # --- Agenda slide ---
    slide = prs.slides.add_slide(blank_layout)
    fill_bg(slide, WHITE)
    tb = slide.shapes.add_textbox(Inches(0.9), Inches(0.6), Inches(11), Inches(1))
    tb.text_frame.text = "Agenda"
    tb.text_frame.paragraphs[0].font.size = Pt(34)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = INK

    for i, (_, heading) in enumerate(SECTION_ORDER):
        y = Inches(1.9 + i * 0.9)
        circle = slide.shapes.add_shape(9, Inches(1), y, Inches(0.5), Inches(0.5))
        circle.fill.solid()
        circle.fill.fore_color.rgb = PERIWINKLE
        circle.line.fill.background()
        circle.text_frame.text = str(i + 1)
        circle.text_frame.paragraphs[0].font.color.rgb = WHITE
        circle.text_frame.paragraphs[0].font.bold = True
        circle.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        label = slide.shapes.add_textbox(Inches(1.8), y + Inches(0.05), Inches(9), Inches(0.5))
        label.text_frame.text = heading
        label.text_frame.paragraphs[0].font.size = Pt(20)
        label.text_frame.paragraphs[0].font.color.rgb = INK_SOFT

    # --- Content slides ---
    for key, heading in SECTION_ORDER:
        bullets = await _bulletize(outputs.get(key, ""))

        slide = prs.slides.add_slide(blank_layout)
        fill_bg(slide, WHITE)

        header_bar = slide.shapes.add_shape(1, 0, 0, prs.slide_width, Inches(1.1))
        header_bar.fill.solid()
        header_bar.fill.fore_color.rgb = PERIWINKLE
        header_bar.line.fill.background()

        title_box = slide.shapes.add_textbox(Inches(0.7), Inches(0.25), Inches(11.9), Inches(0.7))
        title_box.text_frame.text = heading
        title_box.text_frame.paragraphs[0].font.size = Pt(28)
        title_box.text_frame.paragraphs[0].font.bold = True
        title_box.text_frame.paragraphs[0].font.color.rgb = WHITE

        body_box = slide.shapes.add_textbox(Inches(1), Inches(1.7), Inches(11.3), Inches(5.3))
        body_tf = body_box.text_frame
        body_tf.word_wrap = True

        for i, bullet in enumerate(bullets):
            p = body_tf.paragraphs[0] if i == 0 else body_tf.add_paragraph()
            p.text = f"●  {bullet}"
            p.font.size = Pt(20)
            p.font.color.rgb = INK_SOFT
            p.space_after = Pt(14)

    path = os.path.join(OUTPUT_DIR, f"{project.id}_slides.pptx")
    prs.save(path)
    return path