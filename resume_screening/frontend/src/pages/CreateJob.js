import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateJob() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
            await axios.post('http://localhost:5001/api/jobs', {
                title: formData.title,
                description: formData.description,
                requiredSkills: skillsArray
            }, { withCredentials: true });
            navigate('/jobs');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create job');
        }
    };

    return (
        <div className="page container">
            <div className="max-w-2xl mx-auto">
                <h1 className="mb-6">Post New Job</h1>
                <div className="card">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Job Title</label>
                            <input
                                type="text"
                                className="form-input"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Software Engineer"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Job Description</label>
                            <textarea
                                className="form-textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Enter job details..."
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Required Skills (comma separated)</label>
                            <input
                                type="text"
                                className="form-input"
                                name="requiredSkills"
                                value={formData.requiredSkills}
                                onChange={handleChange}
                                placeholder="Python, React, AWS..."
                                required
                            />
                        </div>

                        <div className="mt-8">
                            <button type="submit" className="btn btn-primary w-full">Create Job Post</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateJob;
