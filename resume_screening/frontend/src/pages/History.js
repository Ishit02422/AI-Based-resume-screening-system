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
      <h1 className="mb-6">Resume Analysis History</h1>

      <section className="card">
        <div className="grid" style={{ gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Min Score</label>
            <input
              type="number"
              className="form-input"
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Search Keywords</label>
            <input
              type="text"
              className="form-input"
              placeholder="Skills, name..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <div className="flex gap-4 items-end">
            <button className="btn btn-primary" onClick={() => setPage(1)}>Filter</button>
            <button className="btn btn-ghost" onClick={() => setFilters({ minScore: '', from: '', to: '', q: '', limit: 10, jobId: '' })}>Reset</button>
          </div>
        </div>
      </section>

      <div className="mt-10">
        {resumes.sort((a, b) => b.score - a.score).map((r, index) => {
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

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="muted small">Uploaded: {new Date(r.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <span className={`badge ${r.interviewStatus === 'Shortlisted' ? 'bg-success' : 'bg-secondary'}`}>
                    {r.interviewStatus}
                  </span>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setOpenId(openId === r._id ? null : r._id)}>
                    {openId === r._id ? 'Hide Analysis' : 'Show Analysis'}
                  </button>
                </div>
              </div>

              {openId === r._id && (
                <div className="mt-4 pt-4 border-t">
                  <Result data={r} />
                  {['recruiter', 'admin'].includes(user?.role) && r.interviewStatus === 'Not Reviewed' && (
                    <div className="mt-8 p-4 bg-slate-50 border rounded-lg">
                      <p className="form-label mb-3">Recruiter Decision (Step 10):</p>
                      <div className="flex gap-3">
                        <button className="btn btn-primary" onClick={() => updateStatus(r._id, 'Shortlisted')}>
                          Shortlist Candidate
                        </button>
                        <button className="btn btn-ghost" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => updateStatus(r._id, 'Rejected')}>
                          Move to Reject
                        </button>
                      </div>
                    </div>
                  )}
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
