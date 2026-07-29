import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Result from '../components/Result';
import AuthContext from '../context/AuthContext';

function History() {
  const [resumes, setResumes] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [filters, setFilters] = useState({
    from: '',
    to: '',
    minScore: '',
    q: '',
    limit: 10,
    jobId: initialJobId
  });

  const [openId, setOpenId] = useState(null);
  const [currentEdit, setCurrentEdit] = useState({});
  const [activeTab, setActiveTab] = useState('All');
  const { user } = useContext(AuthContext);

  const STATUS_OPTIONS = ['Not Reviewed', 'Shortlisted', 'Rejected', 'Interview Scheduled', 'Interviewed', 'Offer Extended', 'Hired'];

  useEffect(() => {
    load();
  }, [page, filters]);

  async function load() {
    setLoading(true);
    try {
      const params = { page, limit: filters.limit };
      if (filters.minScore) params.minScore = filters.minScore;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.q) params.q = filters.q;
      if (filters.jobId) params.jobId = filters.jobId;

      const res = await axios.get('/api/resume/my', { params, withCredentials: true });
      setResumes(res.data.data);
      setTotal(res.data.total || res.data.data?.length || 0);
      setPages(res.data.pages || 1);
      setOpenId(null);
      setCurrentEdit({});
    } catch (err) {
      console.error('Load error:', err);
      alert('Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus, note = '') {
    try {
      const payload = { status: newStatus, note: note || 'Quick action' };
      const res = await axios.post(`/api/resume/${id}/status`, payload, { withCredentials: true });
      const updated = res.data.data;
      setResumes(prev => prev.map(r => r._id === id ? updated : r));
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status');
    }
  }

  function getRecommendation(score) {
    if (score >= 85) return { label: 'Top Pick', class: 'score-good' };
    if (score >= 70) return { label: 'Highly Recommended', class: 'bg-primary' };
    if (score >= 50) return { label: 'Potential Match', class: 'score-warn' };
    return { label: 'Low Match', class: 'score-bad' };
  }

  return (
    <div className="page container">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="mb-2">Applicant Tracking Dashboard</h1>
          <p className="muted small">Manage and screen candidates across your active job postings.</p>
        </div>
        <div className="flex gap-4">
          <div className="card-mini bg-success-faded">
            <span className="small font-bold">Total Applicants: {total}</span>
          </div>
        </div>
      </div>

      <section className="card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Min Score</label>
            <input
              type="number"
              className="form-input"
              style={{ width: '100px', padding: '8px 12px' }}
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 flex-1" style={{ minWidth: '250px' }}>
            <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Search Keywords</label>
            <input
              type="text"
              className="form-input"
              style={{ padding: '8px 12px' }}
              placeholder="Skills, name..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary" style={{ padding: '8px 20px' }} onClick={() => setPage(1)}>Filter</button>
            <button className="btn btn-ghost" style={{ padding: '8px 20px' }} onClick={() => setFilters({ minScore: '', from: '', to: '', q: '', limit: 10, jobId: '' })}>Reset</button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mb-6 mt-10" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
        {['All', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'].map(tab => {
          const count = resumes.filter(r => tab === 'All' || r.interviewStatus === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                background: isActive ? undefined : 'rgba(255, 255, 255, 0.02)',
                borderColor: isActive ? undefined : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'All' ? 'All Applicants' : tab === 'Interview Scheduled' ? 'Interviews' : tab}
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 6px', 
                borderRadius: '999px', 
                background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', 
                fontSize: '11px',
                color: isActive ? '#fff' : 'var(--text-muted)'
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {resumes
          .filter(r => activeTab === 'All' || r.interviewStatus === activeTab)
          .sort((a, b) => b.score - a.score)
          .map((r, index) => {
          const recommendation = getRecommendation(r.score);
          return (
            <div key={r._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="card-title">{r.fileName?.split('-')[1] || 'Standard Resume'}</h3>
                    <span className={`badge ${recommendation.class}`} style={{ fontSize: '10px' }}>
                      {recommendation.label}
                    </span>
                  </div>
                  {r.jobId?.title && <p className="small muted">Applied for: {r.jobId.title}</p>}
                </div>
                <div className={`score-badge ${r.score >= 75 ? 'score-good' : r.score >= 50 ? 'score-warn' : 'score-bad'}`}>
                  {Math.round(r.score || 0)}% Match
                </div>
              </div>

              {/* Hiring Pipeline Visual */}
              <div className="hiring-pipeline-container my-6">
                <div className="pipeline-track"></div>
                <div className="flex justify-between relative">
                  <div className="pipeline-step active">
                    <div className="step-dot"></div>
                    <span className="step-label">Applied</span>
                  </div>
                  <div className={`pipeline-step ${r.score > 0 ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">System Screened</span>
                  </div>
                  <div className={`pipeline-step ${['shortlisted', 'interview scheduled', 'interviewed', 'offer extended', 'hired'].includes(r.interviewStatus?.toLowerCase()) ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">Shortlisted</span>
                  </div>
                  <div className={`pipeline-step ${['interview scheduled', 'interviewed', 'offer extended', 'hired'].includes(r.interviewStatus?.toLowerCase()) ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">Interview</span>
                  </div>
                  <div className={`pipeline-step ${['hired'].includes(r.interviewStatus?.toLowerCase()) ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">Hired</span>
                  </div>
                </div>
              </div>

              {/* Status History Logs (Activity History Log) */}
              {r.interviewHistory && r.interviewHistory.length > 0 && (
                <div className="status-history-log mb-6" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <p className="small font-bold muted mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Change Log / History</p>
                  <div className="flex flex-col gap-3">
                    {r.interviewHistory.map((log, logIdx) => (
                      <div key={logIdx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: log.status === 'Hired' ? '#10b981' : log.status === 'Rejected' ? '#ef4444' : '#3b82f6', 
                            display: 'inline-block' 
                          }}></span>
                          <span className="font-bold" style={{ color: log.status === 'Hired' ? '#10b981' : log.status === 'Rejected' ? '#ef4444' : '#a5b4fc' }}>
                            {log.status}
                          </span>
                          <span className="muted">by Recruiter</span>
                        </div>
                        <span className="muted">{new Date(log.at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="muted small">Uploaded: {new Date(r.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  {['recruiter', 'admin'].includes(user?.role) ? (
                    <>
                      {r.interviewStatus === 'Not Reviewed' && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => updateStatus(r._id, 'Shortlisted')}>
                            Shortlist
                          </button>
                          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => updateStatus(r._id, 'Rejected')}>
                            Reject
                          </button>
                        </>
                      )}
                      {r.interviewStatus === 'Shortlisted' && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} onClick={() => updateStatus(r._id, 'Interview Scheduled')}>
                            Schedule Interview
                          </button>
                          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => updateStatus(r._id, 'Rejected')}>
                            Reject
                          </button>
                        </>
                      )}
                      {r.interviewStatus === 'Interview Scheduled' && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => updateStatus(r._id, 'Hired')}>
                            Hire Candidate
                          </button>
                          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => updateStatus(r._id, 'Rejected')}>
                            Reject
                          </button>
                        </>
                      )}
                      {r.interviewStatus === 'Hired' && (
                        <span className="badge bg-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          Hired 🎉
                        </span>
                      )}
                      {r.interviewStatus === 'Rejected' && (
                        <span className="badge bg-secondary" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          Rejected ❌
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={`badge ${r.interviewStatus === 'Hired' ? 'bg-success' : 'bg-secondary'}`}>
                      {r.interviewStatus}
                    </span>
                  )}
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setOpenId(openId === r._id ? null : r._id)}>
                    {openId === r._id ? 'Hide Analysis' : 'Show Analysis'}
                  </button>
                </div>
              </div>

              {openId === r._id && (
                <div className="mt-4 pt-4 border-t">
                  <Result data={r} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-4 mt-10">
        <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span className="muted">Page {page} of {pages}</span>
        <button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export default History;
