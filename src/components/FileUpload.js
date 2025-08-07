import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FileUpload.css'; // Create this file for custom styling (optional)

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select ZIP files containing Excel sheets');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setLoading(true);
    setStatus('Uploading and merging Excel files from ZIPs...');

    try {
      const response = await axios.post('https://excel-data-merge-backend.onrender.com/api/merge', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'merged_output.xlsx';
      link.click();

      setStatus('✅ Merged file downloaded successfully!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Failed to merge Excel files from ZIPs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg">
        <h3 className="mb-4 text-center">📦 Upload ZIP Files (Each with Excel)</h3>
        
        <input
          type="file"
          className="form-control"
          multiple
          accept=".zip"
          onChange={handleFileChange}
        />

        <button
          className="btn btn-primary mt-3 w-100"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            'Merge Excel Files from ZIPs'
          )}
        </button>

        {status && (
          <div className="alert alert-info mt-3 text-center">{status}</div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
