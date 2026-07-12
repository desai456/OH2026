"""
chatbot.py -- AI Chatbot (Bonus)

Lets users ask natural-language questions like:
  - "Show last month's ESG report"
  - "Which department has the highest emissions?"
  - "Who earned the most badges?"
  - "How can we reduce carbon emissions?"
  - "What is our ESG score?"

This is NOT a trained ML model -- it's a thin wrapper: your app's own
data (ESG scores, department stats, badges, etc.) is fetched and
summarized into a prompt, which is sent to an LLM (OpenAI / Gemini /
Llama 3) to produce a natural-language answer. This keeps the LLM
grounded in YOUR real numbers instead of making things up.

Setup:
    pip install openai          # if using OpenAI
    export OPENAI_API_KEY=...   # set your key as an environment variable

    (Swap the _call_llm() implementation below for Gemini or a local
    Llama 3 endpoint if you prefer -- the rest of the file doesn't change.)

Usage:
    from chatbot import ask_chatbot

    answer = ask_chatbot(
        question="Which department has the highest emissions?",
        context_data=get_context_data(),  # your own function, see below
    )
"""
import os
import json


def get_context_data():
    """
    STUB -- replace this with real queries against your project's
    database. This function should return a dict summarizing whatever
    data the chatbot might need to answer questions accurately.

    Keeping this data fetch separate from the chatbot logic means you
    can plug in your actual MySQL/reporting queries here without
    touching the LLM-calling code below.
    """
    return {
        "current_esg_score": 78,
        "predicted_next_month_esg_score": 81,
        "departments": [
            {"name": "IT", "carbon_emission": 45, "risk_level": "Medium Risk"},
            {"name": "Manufacturing", "carbon_emission": 120, "risk_level": "High Risk"},
            {"name": "HR", "carbon_emission": 15, "risk_level": "Low Risk"},
        ],
        "top_badge_earners": [
            {"employee": "EMP0231", "badges": 14},
            {"employee": "EMP0117", "badges": 12},
        ],
        "recommendations": [
            "Switch to hybrid vehicles",
            "Install solar panels",
            "Reduce paper usage",
        ],
    }


def _build_prompt(question, context_data):
    return (
        "You are an ESG reporting assistant for a company sustainability "
        "dashboard. Answer the user's question using ONLY the data below. "
        "If the data doesn't contain the answer, say so honestly instead "
        "of guessing.\n\n"
        f"DATA:\n{json.dumps(context_data, indent=2)}\n\n"
        f"QUESTION: {question}\n\n"
        "Answer concisely, in plain language a manager can act on."
    )


def _call_llm_openai(prompt):
    """Requires: pip install openai, and OPENAI_API_KEY set."""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
    )
    return response.choices[0].message.content


def ask_chatbot(question, context_data=None):
    if context_data is None:
        context_data = get_context_data()

    prompt = _build_prompt(question, context_data)
    return _call_llm_openai(prompt)


if __name__ == "__main__":
    if not os.environ.get("OPENAI_API_KEY"):
        print("Set OPENAI_API_KEY before running this demo, e.g.:")
        print("  export OPENAI_API_KEY=sk-...")
    else:
        answer = ask_chatbot("Which department has the highest emissions and what should we do about it?")
        print(answer)
