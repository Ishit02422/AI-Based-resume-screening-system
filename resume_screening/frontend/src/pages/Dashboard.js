import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/resume/my', { withCredentials: true });
        setResumes(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    if (user) load();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus, note: 'Action from Dashboard' };
      const res = await axios.post(`/api/resume/${id}/status`, payload, { withCredentials: true });
      const updated = res.data.data;
      setResumes(prev => prev.map(r => r._id === id ? updated : r));
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status');
    }
  };

  if (!user) return <div style={{ padding: 20 }}>Please login to view your dashboard</div>;

  const isRecruiter = user.role === 'recruiter' || user.role === 'admin';
  const shortlistedCount = resumes.filter(r => {
    const s = r.interviewStatus?.toLowerCase();
    return s && s !== 'not reviewed' && s !== 'rejected';
  }).length;
  const pendingCount = resumes.filter(r => !r.interviewStatus || r.interviewStatus?.toLowerCase() === 'not reviewed').length;

  return (
    <div className="page container">
      <div className={`role-banner ${isRecruiter ? 'recruiter-theme' : 'candidate-theme'} mb-8`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{isRecruiter ? 'RECRUITER CONSOLE' : 'CANDIDATE HUB'}</h1>
            <p className="small">Logged in as {user.name || user.email}</p>
          </div>
          <div className="flex gap-4">
            {!isRecruiter && <a href="/upload" className="btn btn-white">Process New Resume</a>}
            {isRecruiter && <a href="/create-job" className="btn btn-white">Post New Opening</a>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="card text-center p-6" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p className="small muted font-bold mb-1">TOTAL {isRecruiter ? 'APPLICATIONS' : 'ANALYSES'}</p>
          <h2 className="text-3xl font-bold">{resumes.length}</h2>
        </div>
        <div className="card text-center p-6" style={{ borderLeft: '4px solid #10b981' }}>
          <p className="small muted font-bold mb-1">{isRecruiter ? 'SHORTLISTED' : 'SUCCESSFUL MATCHES'}</p>
          <h2 className="text-3xl font-bold text-success" style={{ color: '#10b981' }}>{shortlistedCount}</h2>
        </div>
        <div className="card text-center p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p className="small muted font-bold mb-1">PENDING REVIEW</p>
          <h2 className="text-3xl font-bold text-warn" style={{ color: '#f59e0b' }}>{pendingCount}</h2>
        </div>
      </div>

      {/* Analytics Charts */}
      {resumes.length > 0 && (() => {
        const rejectedCount = resumes.filter(r => r.interviewStatus?.toLowerCase() === 'rejected').length;
        const hiredCount = resumes.filter(r => r.interviewStatus?.toLowerCase() === 'hired').length;
        const interviewCount = resumes.filter(r => r.interviewStatus?.toLowerCase() === 'interview scheduled').length;
        const processingFailedCount = resumes.filter(r => r.interviewStatus?.toLowerCase() === 'processing failed').length;

        // Pie chart segments
        const pieData = [
          { label: 'Shortlisted', count: shortlistedCount - interviewCount - hiredCount, color: '#6366f1' },
          { label: 'Interview', count: interviewCount, color: '#3b82f6' },
          { label: 'Hired', count: hiredCount, color: '#10b981' },
          { label: 'Rejected', count: rejectedCount, color: '#ef4444' },
          { label: 'Pending', count: pendingCount, color: '#f59e0b' },
          { label: 'Failed', count: processingFailedCount, color: '#64748b' },
        ].filter(d => d.count > 0);

        const totalForPie = pieData.reduce((s, d) => s + d.count, 0) || 1;
        let cumPercent = 0;
        const gradientStops = pieData.map(d => {
          const start = cumPercent;
          cumPercent += (d.count / totalForPie) * 100;
          return `${d.color} ${start}% ${cumPercent}%`;
        }).join(', ');

        // Bar chart: score distribution
        const score90 = resumes.filter(r => (r.score || 0) >= 90).length;
        const score70 = resumes.filter(r => (r.score || 0) >= 70 && (r.score || 0) < 90).length;
        const score50 = resumes.filter(r => (r.score || 0) >= 50 && (r.score || 0) < 70).length;
        const scoreLow = resumes.filter(r => (r.score || 0) < 50).length;
        const maxBar = Math.max(score90, score70, score50, scoreLow, 1);

        const barData = [
          { label: '90%+', count: score90, color: '#10b981', tag: 'Excellent' },
          { label: '70-89%', count: score70, color: '#6366f1', tag: 'Strong' },
          { label: '50-69%', count: score50, color: '#f59e0b', tag: 'Average' },
          { label: '<50%', count: scoreLow, color: '#ef4444', tag: 'Low' },
        ];

        return (
          <div className="charts-section">
            {/* Pie Chart */}
            <div className="chart-card">
              <h4>📊 Status Distribution</h4>
              <div className="pie-chart-wrapper">
                <div
                  className="pie-chart"
                  style={{ background: pieData.length > 0 ? `conic-gradient(${gradientStops})` : '#1e293b' }}
                >
                  <div className="pie-chart-hole">
                    <span className="pie-total">{resumes.length}</span>
                    <span className="pie-label">Total</span>
                  </div>
                </div>
                <div className="pie-legend">
                  {pieData.map((d, i) => (
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ background: d.color }}></span>
                      <span className="muted">{d.label}</span>
                      <span className="legend-count">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="chart-card">
              <h4>📈 Score Distribution</h4>
              <div className="bar-chart">
                {barData.map((b, i) => (
                  <div key={i} className="bar-row">
                    <span className="bar-label">{b.label}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${Math.max((b.count / maxBar) * 100, b.count > 0 ? 15 : 0)}%`,
                          background: `linear-gradient(90deg, ${b.color}, ${b.color}dd)`
                        }}
                      >
                        {b.count > 0 && b.tag}
                      </div>
                    </div>
                    <span className="bar-count">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex justify-between items-center mb-6 mt-10">
        <h3 className="font-bold">{isRecruiter ? 'Recent Applicant Activity' : 'Your Recent Applications'}</h3>
        <a href="/history" className="small font-bold text-primary">View All {resumes.length} Records →</a>
      </div>

      {resumes.length === 0 ? (
        <div className="card text-center py-16">
          <p className="muted mb-6">No records found yet.</p>
          <a href={isRecruiter ? "/create-job" : "/upload"} className="btn btn-primary">
            {isRecruiter ? "Post Your First Job" : "Upload Now"}
          </a>
        </div>
      ) : (
        <div>
          <div className="grid">
            {resumes.slice(0, 5).map(r => (
              <div key={r._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {isRecruiter ? (
                      <>
                        <h3 className="card-title mb-1">{r.user?.name || r.fileName?.split('-')[1] || 'Candidate'}</h3>
                        <p className="small muted">Applied for: {r.jobId?.title || 'General'}</p>
                      </>
                    ) : (
                      <h3 className="card-title">{r.jobId?.title || 'General Analysis'}</h3>
                    )}
                  </div>
                  <div className={`score-badge ${r.score >= 75 ? 'score-good' : r.score >= 50 ? 'score-warn' : 'score-bad'}`}>
                    {Math.round(r.score || 0)}%
                  </div>
                </div>

                <div className="mb-4">
                  <p className="form-label">Top Skills:</p>
                  <div className="flex-wrap">
                    {(r.matchedSkills || r.skills || []).slice(0, 4).map((s, i) => (
                      <span key={i} className="chip">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="muted small">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    {isRecruiter && r.interviewStatus === 'Not Reviewed' ? (
                      <>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => updateStatus(r._id, 'Shortlisted')}
                        >
                          Shortlist
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)' }}
                          onClick={() => updateStatus(r._id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${r.interviewStatus === 'Shortlisted' ? 'bg-success' : 'bg-secondary'}`}>
                        {r.interviewStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;