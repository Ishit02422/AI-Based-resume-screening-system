import axios from "axios";
import { useState, useRef } from "react";
import Result from "./Result";
import "../App.css";

function ResumeUpload({ jobId, onResult }) {
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    if (onResult) onResult(null);
    const formData = new FormData();
    formData.append("resume", file);
    if (jobId) formData.append("jobId", jobId);
    try {
      setErrorMsg(null);
      setIsAnalysing(false);
      const res = await axios.post(
        "/api/resume/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
            if (percent === 100) setIsAnalysing(true);
          },
          timeout: 60000
        }
      );
      setResult(res.data.data);
      if (onResult) onResult(res.data.data);
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err?.response?.data?.error || err?.message || 'Upload failed';
      setErrorMsg(msg);
    } finally {
      setProgress(0);
      setIsAnalysing(false);
    }
  };

  const handleFiles = (files) => {
    const file = files && files[0];
    uploadFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  return (
    <div className="upload-container">
      <div
        className={`drop-zone ${dragOver ? "active" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        <div className="mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="var(--primary)">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="form-label">Click or Drag Resume Here</p>
        <p className="muted small">Supports PDF, DOCX (Max 10MB)</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {fileName && (
        <div className="card mt-6">
          <div className="flex justify-between items-center">
            <span className="font-bold">{fileName}</span>
            {progress > 0 && <span className="muted small">{progress}%</span>}
          </div>
          {progress > 0 && (
            <div className="progress-bar mt-2">
              <div className="progress" style={{ width: `${progress}%` }} />
            </div>
          )}

          {isAnalysing && (
            <div className="mt-4 flex items-center gap-3">
              <div className="spinner small" />
              <p className="muted small font-bold">Step 4: System Extracting skills & experience...</p>
            </div>
          )}

          {errorMsg && <div className="alert alert-danger mt-4">{errorMsg}</div>}
        </div>
      )}

      {!onResult && result && (
        <div className="mt-8">
          <Result data={result} />
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
