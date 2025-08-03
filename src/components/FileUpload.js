import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');

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

    setStatus('Uploading and merging Excel files from ZIPs...');

    try {
      const response = await axios.post('https://excel-data-merge-backend.onrender.com/api/merge', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'merged_output.xlsx';
      link.click();

      setStatus('Merged file downloaded successfully!');
    } catch (error) {
      console.error(error);
      setStatus('Failed to merge Excel files from ZIPs.');
    }
  };

  return (
    <div className="card p-4 shadow">
      <h3 className="mb-3 text-center">📦 Upload ZIP Files (Each with Excel)</h3>
      <input
        type="file"
        className="form-control"
        multiple
        accept=".zip"
        onChange={handleFileChange}
      />
      <button className="btn btn-primary mt-3" onClick={handleUpload}>
        Merge Excel Files from ZIPs
      </button>
      {status && <p className="mt-3 alert alert-info">{status}</p>}
    </div>
  );
};

export default FileUpload;
