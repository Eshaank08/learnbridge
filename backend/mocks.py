"""
Mock question generation — works for ANY node, no canned per-node files.
Produces node-specific questions templated from the node's own title/summary.
"""


def mock_questions(node: dict) -> list[dict]:
    title: str = node["title"]
    summary: str = node.get("summary", "")
    num: int = node["test"]["numQuestions"]

    # Build a pool of MCQ questions, then append 1 short question.
    # The prompts reference the node title so two different nodes yield visibly
    # different output.

    # Extract a short excerpt from the summary (first ~80 chars) for variety.
    excerpt = (summary[:80] + "...") if len(summary) > 80 else summary

    mcq_pool = [
        {
            "id": "q1",
            "type": "mcq",
            "prompt": f"Which statement best describes the main focus of '{title}'?",
            "options": [
                f"It covers the core ideas of {title} from first principles.",
                f"It is an unrelated topic with no connection to {title}.",
                f"It skips foundational material and jumps straight to advanced proofs.",
                f"It focuses exclusively on historical background, not practical skills.",
            ],
            "correctIndex": 0,
        },
        {
            "id": "q2",
            "type": "mcq",
            "prompt": (
                f"According to the overview of '{title}', which outcome should "
                "a learner achieve by the end of this topic?"
            ),
            "options": [
                f"Memorise a list of unrelated facts about {title}.",
                f"Recognise, apply, and explain the key concepts introduced in {title}.",
                f"Skip directly to the most advanced subtopic without building foundations.",
                f"Avoid practising examples and rely on intuition alone.",
            ],
            "correctIndex": 1,
        },
        {
            "id": "q3",
            "type": "mcq",
            "prompt": (
                f"The topic '{title}' begins with: \"{excerpt}\". "
                "What does this suggest about its pedagogical approach?"
            ),
            "options": [
                "It assumes all prior knowledge and provides no definitions.",
                "It builds understanding step by step from clearly defined terms.",
                "It presents results without explanation or worked examples.",
                "It is intended for experts only and excludes beginners.",
            ],
            "correctIndex": 1,
        },
        {
            "id": "q4",
            "type": "mcq",
            "prompt": f"Which skill is NOT expected to be gained from studying '{title}'?",
            "options": [
                f"Understanding the fundamental building blocks of {title}.",
                f"Applying the concepts of {title} to new problems.",
                f"Bypassing all prerequisite knowledge before starting {title}.",
                f"Recognising patterns taught in {title} in more advanced contexts.",
            ],
            "correctIndex": 2,
        },
        {
            "id": "q5",
            "type": "mcq",
            "prompt": (
                f"A student claims that '{title}' has no prerequisites and can be "
                "studied in any order. Based on the topic overview, is this correct?"
            ),
            "options": [
                "Yes, all topics in the roadmap are completely independent.",
                "No, the roadmap explicitly places this topic in a dependency chain.",
                "Yes, prerequisite order is optional and only affects speed.",
                "No, but only because the topic is too advanced for beginners.",
            ],
            "correctIndex": 1,
        },
    ]

    short_question = {
        "id": f"q{num}",
        "type": "short",
        "prompt": (
            f"In your own words, explain what you expect to learn from '{title}' "
            "and why it matters for the topics that come after it."
        ),
    }

    # We want (num - 1) MCQs + 1 short question.
    num_mcq = max(1, num - 1)
    selected_mcq = mcq_pool[:num_mcq]

    # Re-assign sequential ids.
    for i, q in enumerate(selected_mcq, start=1):
        q["id"] = f"q{i}"
    short_question["id"] = f"q{len(selected_mcq) + 1}"

    return selected_mcq + [short_question]
