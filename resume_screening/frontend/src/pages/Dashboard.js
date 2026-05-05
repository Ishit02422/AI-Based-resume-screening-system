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