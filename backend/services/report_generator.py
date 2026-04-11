"""
EquiScore Growth Report Generator
=================================
Compiles evaluation data, generated action plans, and WeasyPrint 
to produce a beautifully formatted PDF report for non-advancing teams.
"""

from __future__ import annotations

import base64
import os
from datetime import datetime
from pathlib import Path

import structlog
import weasyprint
from jinja2 import Environment, FileSystemLoader

from schemas.evaluation import EvaluationStatusResponse
from services.report_llm_writer import ReportLLMWriter

logger = structlog.get_logger(__name__)

# Locate the assets directory relative to this file
ASSETS_DIR = Path(__file__).parent.parent / "assets" / "report_template"


def generate_score_ring_svg(score: int, max_score: int = 100) -> str:
    """Generate inline SVG for the score ring on the cover page."""
    # Settings
    size = 200
    stroke_width = 15
    radius = (size - stroke_width) / 2
    circumference = 2 * 3.14159 * radius
    offset = circumference - (score / max_score) * circumference
    
    color = "#00A88A" if score >= 80 else ("#F39C12" if score >= 50 else "#C0392B")
    
    svg = f'''
    <svg width="100%" height="100%" viewBox="0 0 {size} {size}" style="transform: rotate(-90deg);">
      <circle cx="{size/2}" cy="{size/2}" r="{radius}" fill="none" stroke="#E0E0F0" stroke-width="{stroke_width}"/>
      <circle cx="{size/2}" cy="{size/2}" r="{radius}" fill="none" stroke="{color}" stroke-width="{stroke_width}" stroke-dasharray="{circumference}" stroke-dashoffset="{offset}" stroke-linecap="round"/>
    </svg>
    '''
    return svg


def generate_pacing_bar_svg() -> str:
    """Mock pacing SVG for presentation delivery."""
    return '''
    <svg width="100%" height="30px" viewBox="0 0 100 30" preserveAspectRatio="none">
        <rect x="0" y="10" width="30" height="10" fill="#E0E0F0" rx="3" />
        <rect x="35" y="10" width="40" height="10" fill="#00A88A" rx="3" />
        <rect x="80" y="10" width="20" height="10" fill="#E0E0F0" rx="3" />
        <text x="15" y="8" font-size="6" fill="#666" text-anchor="middle">Slow</text>
        <text x="55" y="8" font-size="6" fill="#00A88A" font-weight="bold" text-anchor="middle">Optimal Pacing</text>
        <text x="90" y="8" font-size="6" fill="#666" text-anchor="middle">Rushed</text>
    </svg>
    '''


class GrowthReportGenerator:
    """
    Main PDF generation service.
    """

    def __init__(self) -> None:
        self.llm_writer = ReportLLMWriter()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(ASSETS_DIR)),
            autoescape=True
        )

    async def generate(self, evaluation_data: EvaluationStatusResponse, behavior_data: dict | None = None) -> bytes:
        """
        Generate the PDF report bytes.
        """
        if evaluation_data.result is None:
            raise ValueError("Evaluation must be completed to generate report.")
            
        logger.info(
            "report_generation_started",
            team=evaluation_data.team_name,
            job_id=str(evaluation_data.job_id)
        )

        try:
            # 1. Generate Custom Action Plan via LLM
            action_plan = await self.llm_writer.generate_action_plan(
                evaluation=evaluation_data.result,
                track=evaluation_data.track,
                team_name=evaluation_data.team_name
            )

            # 2. Add SVG generators for behavioral if provided
            behavioral_context = None
            if behavior_data:
                # Assuming behavior_data is a dictionary for now based on the prompt signature 'BehaviorAnalysisResult' (which wasn't provided, so we treat it generically)
                behavioral_context = behavior_data.copy()
                behavioral_context["pacing_svg"] = generate_pacing_bar_svg()

            # 3. Render HTML with Jinja2
            template = self.jinja_env.get_template("report.html.j2")
            rendered_html = template.render(
                team_name=evaluation_data.team_name,
                track_name=evaluation_data.track.value.replace("_", " ").title(),
                date=datetime.now().strftime("%B %d, %Y"),
                overall_score=evaluation_data.result.overall_score,
                score_svg=generate_score_ring_svg(evaluation_data.result.overall_score),
                track_alignment=evaluation_data.result.track_alignment,
                strengths=evaluation_data.result.strengths,
                weaknesses=evaluation_data.result.weaknesses,
                rubric_scores=evaluation_data.result.rubric_scores,
                rubric_justification=evaluation_data.result.rubric_justification,
                action_items=action_plan.action_items,
                closing_paragraph=action_plan.closing_paragraph,
                behavioral=behavioral_context
            )

            # 4. Generate PDF via WeasyPrint
            # base_url helps resolve relative asset paths safely
            html_doc = weasyprint.HTML(string=rendered_html, base_url=str(ASSETS_DIR))
            pdf_bytes = html_doc.write_pdf()

            logger.info(
                "report_generation_completed",
                team=evaluation_data.team_name,
                pdf_size_bytes=len(pdf_bytes)
            )

            return pdf_bytes

        except Exception as e:
            logger.error("report_generation_failed", error=str(e), team=evaluation_data.team_name)
            raise
