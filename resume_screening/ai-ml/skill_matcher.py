from difflib import SequenceMatcher


def _normalize(skill):
    # simple normalization: lowercase and strip non-alphanumeric
    return ''.join(c for c in skill.lower() if c.isalnum())


def match(resume_skills, job_skills, threshold=0.8):
    """Return (score, matched_list, missing_list).
    Uses case-insensitive + simple fuzzy matching to handle variants.
    """
    if not job_skills:
        # If no target skills, return 100% match for the resume's own profile
        return 100, resume_skills, []

    norm_resume = [(_normalize(s), s) for s in resume_skills]
    norm_job = [(_normalize(s), s) for s in job_skills]

    matched = []
    missing = []

    for norm_j, orig_j in norm_job:
        found = None
        # exact first
        for nr, orig_r in norm_resume:
            if nr == norm_j:
                found = orig_r
                break
        # fuzzy match fallback
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

    score = (len(matched) / len(job_skills)) * 100
    return score, matched, missing
