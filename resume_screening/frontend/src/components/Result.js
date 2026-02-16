import React from 'react';

function Result({ data }) {
  if (!data) return null;

  const score = data.score || 0;
  const matched = (data.matchedSkills && data.matchedSkills.length) ? data.matchedSkills : (data.skills || []);

  return (
    <div className="result-card">
      <div className="result-header">
        <h3 className="card-title">Analysis Result</h3>
        <div className={`score-badge ${score >= 75 ? 'score-good' : score >= 50 ? 'score-warn' : 'score-bad'}`}>
          Match Score: {Math.round(score)}%
        </div>
      </div>

      <div className="mt-6">
        <p className="form-label">Matched Skills:</p>
        <div className="flex-wrap">
          {matched.map((skill, i) => (
            <span key={i} className="chip">{skill}</span>
          ))}
          {matched.length === 0 && <span className="muted small">None identified</span>}
        </div>
      </div>

      <div className="mt-6">
        <p className="form-label">Missing Skills:</p>
        <div className="flex-wrap">
          {data.missingSkills && data.missingSkills.length > 0 ? (
            data.missingSkills.map((skill, i) => (
              <span key={i} className="chip missing">{skill}</span>
            ))
          ) : (
            <span className="muted small">No gaps identified</span>
          )}
        </div>
      </div>

      {data.feedback && (
        <div className="mt-8 p-4 bg-slate-50 border border-border rounded-lg text-sm">
          <p className="font-bold mb-1">AI Recommendation:</p>
          <p className="muted">{data.feedback}</p>
        </div>
      )}
    </div>
  );
}

export default Result;
