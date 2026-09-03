from difflib import SequenceMatcher
import re


def _normalize(skill):
    """Normalize skill string for resilient comparison."""
    s = skill.lower().strip()
    # Normalize common abbreviations / suffixes
    s = re.sub(r'[\s\-_\./]+', '', s)
    s = re.sub(r'js$', '', s)  # reactjs -> react, nodejs -> node
    return s


def match(resume_skills, job_skills, threshold=0.75):
    """Return (score, matched_list, missing_list).
    Uses robust normalization + substring inclusion + fuzzy matching.
    """
    if not job_skills:
        # If no target skills provided, return 100% match for the candidate's profile
        return 100, list(resume_skills), []

    norm_resume = [(_normalize(s), s) for s in resume_skills if s]
    matched = []
    missing = []

    for orig_j in job_skills:
        if not orig_j or not str(orig_j).strip():
            continue
        norm_j = _normalize(str(orig_j))
        found = None

        # 1. Exact match on normalized form
        for nr, orig_r in norm_resume:
            if nr == norm_j:
                found = orig_r
                break

        # 2. Substring match for compound skills (e.g. "React" in "React.js", "Node" in "Node.js", "MERN" in "MERN Stack")
        if not found:
            for nr, orig_r in norm_resume:
                if len(nr) >= 3 and len(norm_j) >= 3:
                    if nr in norm_j or norm_j in nr:
                        found = orig_r
                        break

        # 3. Fuzzy matching fallback
        if not found:
            best_ratio = 0
            best_orig = None
            for nr, orig_r in norm_resume:
                ratio = SequenceMatcher(None, nr, norm_j).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_orig = orig_r
            if best_ratio >= threshold:
                found = best_orig

        if found:
            if found not in matched:
                matched.append(found)
        else:
            missing.append(orig_j)

    total_job_skills = len([j for j in job_skills if j and str(j).strip()])
    score = round((len(matched) / total_job_skills) * 100) if total_job_skills > 0 else 100
    return score, matched, missing
