from fastapi import APIRouter
from fastapi.responses import Response
from PySide6.QtWidgets import QApplication

from app.models.bridge import BridgeInput
from fastapi.responses import JSONResponse
from osdagbridge.desktop.ui.docks.cad_cross_section import (
    CrossSectionCADWidget,
)

router = APIRouter(prefix="/cross-section", tags=["Cross Section"])

app_qt = QApplication.instance()

if not app_qt:
    app_qt = QApplication([])

current_widget = None


@router.post("/generate")
def generate_cross_section(data: BridgeInput):
    global current_widget

    widget = CrossSectionCADWidget()

    # Example dynamic inputs
    # Replace with actual widget setters later

    if hasattr(widget, "span"):
        widget.span = data.span

    if hasattr(widget, "carriageway_width"):
        widget.carriageway_width = data.carriageway_width

    widget.resize(1400, 900)

    current_widget = widget

    return {"status": "generated"}


@router.get("/svg")
def get_cross_section_svg():

    global current_widget

    if current_widget is None:
        current_widget = CrossSectionCADWidget()
        current_widget.resize(1400, 900)

    svg_content = current_widget.export_svg()

    return Response(
        content=svg_content,
        media_type="image/svg+xml"
    )
    
@router.get("/hover-zones")
def get_hover_zones():

    global current_widget

    if current_widget is None:
        return JSONResponse(
            status_code=404,
            content={"error": "Cross-section widget not initialized"}
        )

    return current_widget.export_hover_zones()