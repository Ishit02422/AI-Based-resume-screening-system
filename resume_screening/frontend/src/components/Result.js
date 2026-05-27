import React from 'react';

function Result({ data }) {
  if (!data) return null;

  const score = data.score || 0;
  const matchedSkills = data.matchedSkills || data.skills || [];
  const missingSkills = data.missingSkills || [];

  return (
    <div className="analysis-result-container">
      <div className="flex gap-8 mb-8 items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div className="score-circle-container">
          <div className="score-circle" style={{ 
            background: `conic-gradient(var(--primary) ${score}%, #e2e8f0 0)` 
          }}>
            <div className="score-inner">
              <span className="score-value">{Math.round(score)}%</span>
              <span className="score-label">Match</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold">Evaluation Results</h2>
            <span className="badge bg-success" style={{ fontSize: '10px' }}>✓ SYSTEM VERIFIED</span>
          </div>
          <p className="muted mb-4 small">{data.summary || 'Comprehensive profile analysis based on job requirements and candidate profile.'}</p>
          <div className="flex gap-6">
            <div>
              <p className="small font-bold mb-0">{matchedSkills.length}</p>
              <p className="small muted">Matches</p>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0' }}></div>
            <div>
              <p className="small font-bold mb-0">{missingSkills.length}</p>
              <p className="small muted">Missing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6 border-success-light">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-success">
            <span style={{ color: '#10b981' }}>✓</span> Matched Skills
          </h4>
          <div className="flex-wrap">
            {matchedSkills.map((s, i) => (
              <span key={i} className="chip chip-success">{s}</span>
            ))}
            {matchedSkills.length === 0 && <p className="small muted italic">No significant matches.</p>}
          </div>
        </div>

        <div className="card p-6 border-danger-light">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-danger">
            <span style={{ color: '#ef4444' }}>!</span> Skill Gaps
          </h4>
          <div className="flex-wrap">
            {missingSkills.map((s, i) => (
              <span key={i} className="chip chip-danger">{s}</span>
            ))}
            {missingSkills.length === 0 && <p className="small muted italic">No gaps identified.</p>}
          </div>
        </div>
      </div>

      {data.feedback && (
        <div className="mt-8 p-6 bg-primary-faded border-primary-light rounded-xl">
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-bold mb-1 text-primary">Strategic Insight</h4>
              <p className="muted small" style={{ lineHeight: '1.6' }}>{data.feedback}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;
