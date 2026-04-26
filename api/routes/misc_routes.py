import time
from flask import Blueprint, jsonify, request, send_file
import io
try:
    from markdown_pdf import MarkdownPdf, Section
except ImportError:
    MarkdownPdf = None
    Section = None


def create_misc_routes():
    misc_bp = Blueprint("misc", __name__)

    @misc_bp.route("/")
    def health_check():
        return {
            "status": "healthy",
            "message": "Nightlio API is running",
            "timestamp": time.time(),
        }

    @misc_bp.route("/time")
    def get_current_time():
        return {"time": time.time()}

    @misc_bp.route("/export/pdf", methods=["POST"])
    def export_pdf():
        if not MarkdownPdf:
            return jsonify({"error": "markdown-pdf module not installed"}), 501
            
        data = request.get_json()
        if not data or "content" not in data:
            return jsonify({"error": "Content is required"}), 400
            
        content = data.get("content", "")
        
        pdf = MarkdownPdf()
        pdf.add_section(Section(content))
        
        out = io.BytesIO()
        pdf.save(out)
        out.seek(0)
        
        return send_file(
            out,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="entry_export.pdf"
        )

    return misc_bp
