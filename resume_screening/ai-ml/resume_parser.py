import re

# Multi-domain skill list
SKILLS = [
    "python", "react", "sql", "mongodb", "java", "node", "javascript", "html", "css", "aws", "docker", "kubernetes",
    "leadership", "management", "marketing", "sales", "human resources", "hr", "operations", "strategy", "communication",
    "accounting", "tally", "gst", "finance", "banking", "taxation", "auditing", "excel", "data analysis",
    "nursing", "surgery", "patient care", "diagnostics", "pharmacology", "anatomy", "medical records",
    "problem solving", "teamwork", "negotiation", "presentation", "writing", "design", "planning"
]

def extract_skills(text):
    text_lower = text.lower()
    found = []
    
    # 1. Match against predefined list
    for skill in SKILLS:
        if skill in text_lower:
            found.append(skill)
            
    # 2. Fallback: Extract capitalized words (usually Proper Nouns/Skills) if list finds nothing
    if not found:
        # Regex to find words starting with Capital letters (excluding start of sentences)
        potential = re.findall(r'\b[A-Z][a-z]{2,}\b', text)
        found = list(set(potential))[:10] # Limit to top 10 unique words
        
    return found
