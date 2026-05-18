def run_native_analysis(model):

    span = model.get("span", 0)

    max_moment = span * 10
    max_shear = span * 2
    max_displacement = span / 1000

    return {
        "maxMoment": max_moment,
        "maxShear": max_shear,
        "maxDisplacement": max_displacement,
    }