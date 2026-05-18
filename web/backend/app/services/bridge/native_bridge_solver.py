from app.models.bridge import BridgeInput


def run_bridge_analysis(data: BridgeInput):

    span = data.span
    width = data.carriagewayWidth

    max_moment = span * width * 10
    max_shear = span * 5
    max_displacement = span / 500

    return {
        "maxMoment": round(max_moment, 2),
        "maxShear": round(max_shear, 2),
        "maxDisplacement": round(max_displacement, 4),
        "status": "success",
    }