import ResumeUpload from "../components/ResumeUpload";
import { useSearchParams } from "react-router-dom";
import { useState } from 'react';
import Result from '../components/Result';

function UploadPage() {
  const [result, setResult] = useState(null);
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  return (
    <div className="page container">
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-6">Upload Resume for Analysis</h2>
        {jobId && <p className="mb-4 muted">Matching against Job ID: {jobId}</p>}
        <div className="grid" style={{ gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '40px' }}>
          <div>
            <div className="card">
              <ResumeUpload jobId={jobId} onResult={setResult} />
            </div>
          </div>
          {result && (
            <div>
              <Result data={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
