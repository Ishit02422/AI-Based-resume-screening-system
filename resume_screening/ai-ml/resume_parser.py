SKILLS = ["python", "react", "sql", "mongodb", "java", "node"]

def extract_skills(text):
    text = text.lower()
    return [skill for skill in SKILLS if skill in text]
