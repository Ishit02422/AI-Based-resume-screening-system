from flask import Flask, request, jsonify
from resume_parser import extract_skills
from skill_matcher import match
import pdfplumber
import os

app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        if not data or "filePath" not in data:
            return jsonify({"error": "File path not provided"}), 400

        path = data["filePath"]

        # ✅ Debug log (VERY IMPORTANT)
        print("FILE PATH RECEIVED:", path)

        if not os.path.exists(path):
            return jsonify({"error": "File not found"}), 400

        text = ""

        # ✅ PDF handling
        if path.lower().endswith(".pdf"):
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + " "
        else:
            # ✅ TXT fallback and .docx support
            if path.lower().endswith('.docx'):
                try:
                    from docx import Document
                    doc = Document(path)
                    for p in doc.paragraphs:
                        text += p.text + " "
                except Exception as e:
                    print('DOCX parse error:', e)
                    return jsonify({"error": "Failed to parse .docx file"}), 400
            elif path.lower().endswith('.doc'):
                # .doc (binary) not supported in this simple demo
                return jsonify({"error": "Unsupported file type: .doc (use .pdf or .docx)"}), 400
            else:
                with open(path, "r", errors="ignore") as f:
                    text = f.read()

        if not text.strip():
            return jsonify({"error": "Empty resume content"}), 400

        # ✅ Skill extraction
        resume_skills = extract_skills(text)

        # ✅ Job skills (accept job-specific list if provided in request)
        job_skills = data.get('jobSkills') if isinstance(data, dict) and data.get('jobSkills') else ["python", "react", "sql", "mongodb"]

        score, matched, missing = match(resume_skills, job_skills)

        # Debugging
        print("RESUME SKILLS:", resume_skills)
        print("MATCHED:", matched, "MISSING:", missing, "SCORE:", score)

        return jsonify({
            "name": "Candidate",
            "skills": resume_skills,
            "matchedSkills": matched,
            "jobSkills": job_skills,
            "experience": 2,
            "score": score,
            "missingSkills": missing
        })

    except Exception as e:
        print("AI ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
