"""
recommend.py -- Sustainability Recommendation System (rule-based)

Takes current ESG-related metrics and returns actionable recommendations.
This is intentionally rule-based (no training needed) so it works right
away. Once you're logging which recommendations actually get followed
and what impact they had, you can upgrade this to a ranked/ML-scored
recommender (e.g. a classifier that predicts which recommendation is
most likely to be adopted, or has the biggest measured impact).

Usage:
    from recommend import get_recommendations

    recs = get_recommendations(
        carbon_trend="increasing",
        carbon=78,
        paper_usage=65,
        electricity_usage=70,
        fuel_usage=60,
        csr_activities=35,
        compliance=50,
    )
"""

RULES = [
    # (condition_fn, recommendation, priority)
    (lambda m: m.get("carbon_trend") == "increasing" or m.get("carbon", 0) >= 70,
     "Switch to hybrid or electric vehicles for company transport", "High"),

    (lambda m: m.get("paper_usage", 0) >= 60,
     "Reduce paper usage — move to digital documentation and approvals", "Medium"),

    (lambda m: m.get("electricity_usage", 0) >= 70,
     "Install solar panels to offset electricity consumption", "High"),

    (lambda m: m.get("electricity_usage", 0) >= 50,
     "Switch to LED lighting across facilities", "Medium"),

    (lambda m: m.get("fuel_usage", 0) >= 70,
     "Introduce carpooling or remote-work days to cut fuel use", "Medium"),

    (lambda m: m.get("csr_activities", 100) <= 40,
     "Launch more CSR activities/sustainability challenges to boost engagement", "Medium"),

    (lambda m: m.get("compliance", 100) <= 50,
     "Schedule a compliance audit and address outstanding gaps", "High"),

    (lambda m: m.get("water_usage", 0) >= 70,
     "Install water-efficient fixtures and monitor for leaks", "Low"),

    (lambda m: m.get("employee_participation", 100) <= 40,
     "Run awareness campaigns and incentives to increase employee participation", "Low"),
]


def get_recommendations(**metrics):
    """
    Pass any subset of: carbon_trend ('increasing'/'stable'/'decreasing'),
    carbon, paper_usage, electricity_usage, fuel_usage, water_usage,
    csr_activities, compliance, employee_participation (0-100 scores).

    Returns a list of {recommendation, priority} dicts, highest priority first.
    """
    matched = []
    for condition_fn, recommendation, priority in RULES:
        try:
            if condition_fn(metrics):
                matched.append({"recommendation": recommendation, "priority": priority})
        except Exception:
            continue

    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    matched.sort(key=lambda r: priority_order.get(r["priority"], 3))

    if not matched:
        matched.append({
            "recommendation": "Current metrics are within acceptable range — maintain current practices",
            "priority": "Info",
        })

    return matched


if __name__ == "__main__":
    recs = get_recommendations(
        carbon_trend="increasing",
        carbon=78,
        paper_usage=65,
        electricity_usage=72,
        fuel_usage=60,
        csr_activities=35,
        compliance=50,
    )
    for r in recs:
        print(f"[{r['priority']}] {r['recommendation']}")
