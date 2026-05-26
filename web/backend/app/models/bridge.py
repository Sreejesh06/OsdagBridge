# app/models/bridge.py
# Replace your existing BridgeInput with this

from pydantic import BaseModel
from typing import Optional


class BridgeInput(BaseModel):
    # ── Basic inputs (from main dashboard) ──────────────────────────────────
    span_length:        Optional[float] = 35000   # mm
    width:              Optional[float] = 12000   # mm  (overall bridge width)
    num_girders:        Optional[int]   = 4
    skew_angle:         Optional[float] = 0

    # Legacy field names (keep for compatibility)
    span:               Optional[float] = None
    carriageway_width:  Optional[float] = None

    # ── Additional inputs (from modal) ──────────────────────────────────────
    girder_spacing:       Optional[float] = 2750   # mm
    no_of_girders:        Optional[int]   = 4
    deck_overhang_width:  Optional[float] = 1000   # mm
    overall_bridge_width: Optional[float] = None   # mm — overrides width if set
    deck_thickness:       Optional[float] = 200    # mm
    footpath_thickness:   Optional[float] = 200    # mm
    footpath_width:       Optional[float] = 1500   # mm
    footpath_config:      Optional[str]   = "none"

    # ── Crash barrier / railing / median ───────────────────────────────────
    crash_barrier_width:  Optional[float] = 500    # mm
    crash_barrier_type:   Optional[str]   = None
    railing_type:         Optional[str]   = None
    railing_width:        Optional[float] = 375    # mm
    railing_height:       Optional[float] = 1000   # mm
    median_present:       Optional[bool]  = False
    median_width:         Optional[float] = 1200   # mm
    median_type:          Optional[str]   = None

    # ── Wearing course ──────────────────────────────────────────────────────
    wearing_course_thickness: Optional[float] = 50  # mm