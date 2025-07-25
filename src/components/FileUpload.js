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
      alert('Please select Excel files (.xlsx)');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setStatus('Uploading and merging files...');

    try {
      const response = await axios.post('https://marge-excel-data-withoutsaving-user-data.onrender.com/api/merge', formData, {
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
      setStatus('Failed to merge Excel files.');
    }
  };

  return (
    <div className="card p-4 shadow">
      <h3 className="mb-3 text-center">📊 Merge Multiple Excel Files</h3>
      <input
        type="file"
        className="form-control"
        multiple
        accept=".xlsx"
        onChange={handleFileChange}
      />
      <button className="btn btn-primary mt-3" onClick={handleUpload}>
        Merge Excel Files
      </button>
      {status && <p className="mt-3 alert alert-info">{status}</p>}
    </div>
  );
};

export default FileUpload;
