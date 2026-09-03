import re

# Comprehensive Multi-Domain Skill Definitions with regex patterns
SKILL_PATTERNS = [
    # Full Stack & Web Development
    ('MERN Stack', [r'\bmern\s*stack\b', r'\bmern\b']),
    ('MEAN Stack', [r'\bmean\s*stack\b', r'\bmean\b']),
    ('React.js', [r'\breact(?:\.js|js)?\b']),
    ('Node.js', [r'\bnode(?:\.js|js)?\b']),
    ('Express.js', [r'\bexpress(?:\.js|js)?\b']),
    ('MongoDB', [r'\bmongodb\b', r'\bmongo\b']),
    ('JavaScript', [r'\bjavascript\b', r'\bjs\b']),
    ('TypeScript', [r'\btypescript\b', r'\bts\b']),
    ('HTML', [r'\bhtml5?\b']),
    ('CSS', [r'\bcss3?\b']),
    ('Bootstrap', [r'\bbootstrap(?:\s*5)?\b']),
    ('Tailwind CSS', [r'\btailwind(?:\s*css)?\b']),
    ('Next.js', [r'\bnext(?:\.js|js)?\b']),
    ('Vue.js', [r'\bvue(?:\.js|js)?\b']),
    ('Angular', [r'\bangular(?:\.js|js)?\b']),
    ('Redux', [r'\bredux\b']),
    ('REST API', [r'\brest(?:ful)?\s*(?:api|apis)?\b', r'\brest\s*api\b']),
    ('GraphQL', [r'\bgraphql\b']),
    ('Sass / SCSS', [r'\b(?:sass|scss)\b']),
    ('jQuery', [r'\bjquery\b']),

    # Programming Languages
    ('Python', [r'\bpython\b']),
    ('Java', [r'\bjava\b(?!script)']),
    ('C++', [r'(?:\bc\+\+|\bcpp\b)']),
    ('C#', [r'(?:\bc#|\bcsharp\b)']),
    ('C', [r'\bc\s+language\b', r'\bc\s+programming\b']),
    ('PHP', [r'\bphp\b']),
    ('Ruby', [r'\bruby\b']),
    ('Go', [r'\bgolang\b', r'\bgo\s+language\b']),
    ('Rust', [r'\brust\b']),
    ('Kotlin', [r'\bkotlin\b']),
    ('Swift', [r'\bswift\b']),
    ('Dart', [r'\bdart\b']),
    ('Flutter', [r'\bflutter\b']),
    ('React Native', [r'\breact\s*native\b']),

    # Databases & Backend
    ('SQL', [r'\bsql\b']),
    ('MySQL', [r'\bmysql\b']),
    ('PostgreSQL', [r'\b(?:postgresql|postgres)\b']),
    ('SQLite', [r'\bsqlite\b']),
    ('Redis', [r'\bredis\b']),
    ('Firebase', [r'\bfirebase\b']),
    ('Django', [r'\bdjango\b']),
    ('Flask', [r'\bflask\b']),
    ('FastAPI', [r'\bfastapi\b']),
    ('Spring Boot', [r'\bspring\s*boot\b', r'\bspring\s*framework\b']),
    ('Laravel', [r'\blaravel\b']),
    ('ASP.NET', [r'\basp\.net\b', r'\b\.net\b']),

    # Cloud & DevOps
    ('AWS', [r'\baws\b', r'\bamazon\s*web\s*services\b']),
    ('Azure', [r'\bazure\b', r'\bmicrosoft\s*azure\b']),
    ('Google Cloud (GCP)', [r'\b(?:gcp|google\s*cloud)\b']),
    ('Docker', [r'\bdocker\b']),
    ('Kubernetes', [r'\bkubernetes\b', r'\bk8s\b']),
    ('CI/CD', [r'\bci\s*/\s*cd\b', r'\bcicd\b']),
    ('Git', [r'\bgit\b', r'\bgithub\b', r'\bgitlab\b']),
    ('Linux', [r'\blinux\b', r'\bubuntu\b']),
    ('Nginx', [r'\bnginx\b']),

    # AI, ML & Data Science
    ('Artificial Intelligence', [r'\bartificial\s*intelligence\b', r'\bai\b(?:\s+(?:engineer|developer|model|algorithm|tool))']),
    ('Machine Learning', [r'\bmachine\s*learning\b', r'\bml\b(?:\s+(?:engineer|model|algorithm))']),
    ('Deep Learning', [r'\bdeep\s*learning\b']),
    ('Natural Language Processing (NLP)', [r'\bnatural\s*language\s*processing\b', r'\bnlp\b']),
    ('Computer Vision', [r'\bcomputer\s*vision\b']),
    ('TensorFlow', [r'\btensorflow\b']),
    ('PyTorch', [r'\bpytorch\b']),
    ('Pandas', [r'\bpandas\b']),
    ('NumPy', [r'\bnumpy\b']),
    ('Scikit-Learn', [r'\bscikit[\-_]?learn\b', r'\bsklearn\b']),
    ('Data Analysis', [r'\bdata\s*analysis\b', r'\bdata\s*analytics\b']),
    ('Power BI', [r'\bpower\s*bi\b']),
    ('Tableau', [r'\btableau\b']),

    # Management & Soft Skills
    ('Project Management', [r'\bproject\s*management\b']),
    ('Agile / Scrum', [r'\bagile\b', r'\bscrum\b']),
    ('Leadership', [r'\bleadership\b']),
    ('Communication', [r'\bcommunication\b', r'\binterpersonal\s*skills\b']),
    ('Problem Solving', [r'\bproblem\s*solving\b']),
    ('Teamwork', [r'\bteamwork\b', r'\bteam\s*collaboration\b']),
    ('Negotiation', [r'\bnegotiation\b']),
    ('Time Management', [r'\btime\s*management\b']),
    ('Critical Thinking', [r'\bcritical\s*thinking\b']),
    ('Presentation', [r'\bpresentation\b']),

    # Finance, HR & Business
    ('Human Resources (HR)', [r'\bhuman\s*resources\b', r'\bhr\s+(?:manager|executive|operations|policies|management|analytics)\b']),
    ('GST', [r'\bgst\b(?:\s+(?:filing|returns|compliance|tax|invoicing))', r'\bgoods\s+and\s+services\s+tax\b']),
    ('Tally', [r'\btally\b(?:\s*erp)?(?:\s*9)?\b']),
    ('Accounting', [r'\baccounting\b', r'\baccountant\b', r'\bfinancial\s*accounting\b']),
    ('Finance', [r'\bfinance\b', r'\bfinancial\s*analysis\b']),
    ('Auditing', [r'\bauditing\b', r'\baudit\b']),
    ('Taxation', [r'\btaxation\b', r'\btax\s*planning\b']),
    ('Banking', [r'\bbanking\b']),
    ('Marketing', [r'\bmarketing\b', r'\bdigital\s*marketing\b', r'\bseo\b']),
    ('Sales', [r'\bsales\b', r'\bbusiness\s*development\b']),
    ('Operations', [r'\boperations\b', r'\boperations\s*management\b']),
    ('Excel', [r'\b(?:ms\s*)?excel\b', r'\badvanced\s*excel\b']),

    # Healthcare & Medical
    ('Nursing', [r'\bnursing\b', r'\bnurse\b']),
    ('Patient Care', [r'\bpatient\s*care\b']),
    ('Diagnostics', [r'\bdiagnostics\b']),
    ('Surgery', [r'\bsurgery\b', r'\bsurgical\b']),
    ('Pharmacology', [r'\bpharmacology\b', r'\bpharmacy\b']),
    ('Anatomy', [r'\banatomy\b']),
    ('Medical Records', [r'\bmedical\s*records\b', r'\behr\b', r'\bemr\b']),
]

STOP_WORDS = {
    "the", "and", "for", "with", "this", "that", "from", "have", "been", "will", "your",
    "project", "education", "experience", "skills", "summary", "objective", "university",
    "college", "school", "january", "february", "march", "april", "may", "june", "july",
    "august", "september", "october", "november", "december", "present", "candidate",
    "resume", "curriculum", "vitae", "contact", "email", "phone", "profile", "career",
    "gujarat", "india", "mumbai", "delhi", "bangalore", "surat", "pune", "hyderabad",
    "bachelor", "master", "science", "information", "technology", "engineering"
}

def extract_skills(text):
    if not text:
        return []

    text_lower = text.lower()
    found = []

    # 1. Match against comprehensive regex patterns
    for canonical_name, patterns in SKILL_PATTERNS:
        for pattern in patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                found.append(canonical_name)
                break

    # 2. Fallback: Extract capitalized words if predefined search found very few skills
    if len(found) < 2:
        potential = re.findall(r'\b[A-Z][a-zA-Z0-9\+\#\.]{2,}\b', text)
        filtered = []
        for p in potential:
            p_clean = p.strip()
            if p_clean.lower() not in STOP_WORDS and len(p_clean) > 2 and p_clean not in found and p_clean not in filtered:
                filtered.append(p_clean)
        found.extend(filtered[:5])

    return list(dict.fromkeys(found))
