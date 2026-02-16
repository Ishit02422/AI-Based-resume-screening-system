import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [onlyMyJobs, setOnlyMyJobs] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs', { withCredentials: true });
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = onlyMyJobs
    ? jobs.filter(j => j.createdBy === user?._id || j.createdBy?._id === user?._id)
    : jobs;

  const handleApply = (jobId) => {
    navigate(`/upload?jobId=${jobId}`);
  };

  return (
    <div className="page container">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="mb-2">Available Job Openings</h1>
          <p className="muted">Find your next role with targetted skill analysis.</p>
        </div>
        <div className="flex items-center gap-4">
          {user && (user.role === 'recruiter' || user.role === 'admin') && (
            <>
              <label className="flex items-center gap-2 small muted font-bold pointer">
                <input
                  type="checkbox"
                  checked={onlyMyJobs}
                  onChange={(e) => setOnlyMyJobs(e.target.checked)}
                />
                Show My Postings Only
              </label>
              <button className="btn btn-primary" onClick={() => navigate('/create-job')}>
                Post New Job
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="muted">Loading jobs...</p>
        </div>
      ) : (
        <div className="grid">
          {filteredJobs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="muted">{onlyMyJobs ? "You haven't posted any jobs yet." : "No jobs posted yet."}</p>
            </div>
          ) : filteredJobs.map(job => (
            <div className="card" key={job._id}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="card-title">{job.title}</h3>
                  <p className="small muted">Ref: {job._id?.slice(-6).toUpperCase()}</p>
                </div>
                <span className="badge bg-secondary">Full Time</span>
              </div>

              <p className="mb-6 muted" style={{ minHeight: '3em' }}>{job.description}</p>

              <div className="mb-8">
                <p className="form-label">Required Skills:</p>
                <div className="flex-wrap">
                  {job.requiredSkills.map((skill, i) => (
                    <span key={i} className="chip">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="btn btn-primary flex-1" onClick={() => handleApply(job._id)}>
                  Apply Now
                </button>
                {user && (user.role === 'recruiter' || user.role === 'admin') && (
                  <button className="btn btn-ghost flex-1" onClick={() => navigate(`/history?jobId=${job._id}`)}>
                    View Applicants
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
