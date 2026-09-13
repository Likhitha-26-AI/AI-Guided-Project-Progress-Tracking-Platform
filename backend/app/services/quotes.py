"""
Picks one quote per day (same quote all day, changes at midnight) —
deterministic from the date, not random on every page refresh.
Separate pools so the tone fits students vs faculty.
"""
from datetime import date

STUDENT_QUOTES = [
    ("Every expert was once a beginner. Keep building.", "Unknown"),
    ("Progress, not perfection.", "Unknown"),
    ("The best time to start was yesterday. The next best time is now.", "Unknown"),
    ("Small steps every day add up to big things.", "Unknown"),
    ("Done is better than perfect.", "Unknown"),
    ("You don't have to be great to start, but you have to start to be great.", "Zig Ziglar"),
    ("Confusion is the sweat of learning.", "Unknown"),
    ("Debugging is twice as hard as writing the code. Be patient with yourself.", "Unknown"),
    ("A good plan today beats a perfect plan next week.", "Unknown"),
    ("Every bug you fix makes you a better engineer.", "Unknown"),
    ("Momentum matters more than motivation.", "Unknown"),
    ("Your first version doesn't need to be your best version.", "Unknown"),
    ("Consistency beats intensity.", "Unknown"),
    ("Ask for help before you're stuck for hours, not after.", "Unknown"),
]

FACULTY_QUOTES = [
    ("Great mentors shape great builders.", "Unknown"),
    ("The best feedback is timely feedback.", "Unknown"),
    ("Teaching is the art of assisting discovery.", "Mark Van Doren"),
    ("A little guidance early saves a lot of correction later.", "Unknown"),
    ("Progress you can see is progress you can guide.", "Unknown"),
    ("Every student's breakthrough started with someone noticing their effort.", "Unknown"),
    ("Good mentorship is measured in confidence gained, not just grades.", "Unknown"),
    ("The right question at the right time changes everything.", "Unknown"),
    ("Consistency in mentoring builds consistency in students.", "Unknown"),
    ("Small check-ins prevent big setbacks.", "Unknown"),
]


def get_daily_quote(role: str) -> dict:
    pool = STUDENT_QUOTES if role == "student" else FACULTY_QUOTES
    day_index = date.today().toordinal()
    quote, author = pool[day_index % len(pool)]
    return {"quote": quote, "author": author}
