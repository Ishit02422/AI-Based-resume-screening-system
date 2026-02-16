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

  return (
    <div className="page container">
      <div className="flex justify-between items-end mb-8 pb-6 border-b">
        <div>
          <span className="badge bg-secondary mb-2">{isRecruiter ? 'Recruiter Module' : 'Candidate Module'}</span>
          <h1 className="text-3xl">{isRecruiter ? 'Management Console' : 'Applicant Dashboard'}</h1>
          <p className="muted">Welcome, {user.name || user.email}. Overview of your system activity.</p>
        </div>
        <div className="flex gap-4">
          {!isRecruiter && <a href="/upload" className="btn btn-primary">Process New Resume</a>}
          {isRecruiter && <a href="/create-job" className="btn btn-primary">Post New Opening</a>}
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="muted mb-6">No {isRecruiter ? 'applicants' : 'resumes'} found yet.</p>
          <a href={isRecruiter ? "/create-job" : "/upload"} className="btn btn-primary">
            {isRecruiter ? "Post Your First Job" : "Upload Now"}
          </a>
        </div>
      ) : (
        <div>
          <h2 className="mb-6">{isRecruiter ? 'Recent Applicants' : 'My Recent Analysis'}</h2>
          <div className="grid">
            {resumes.map(r => (
              <div key={r._id} className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title">{r.jobId?.title || 'General Analysis'}</h3>
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