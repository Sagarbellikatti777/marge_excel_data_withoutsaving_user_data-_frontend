import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FileUpload.css'; // Optional custom styling for additional tweaks

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeoutError, setTimeoutError] = useState(false);

  // File change handler to accept only .zip files
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate files to ensure they are all ZIP files
    const validFiles = selectedFiles.filter(file => file.name.endsWith('.zip'));
    
    if (validFiles.length !== selectedFiles.length) {
      alert("Only ZIP files are allowed.");
      return;
    }

    setFiles(validFiles);
  };

  // Timer to track time elapsed during the file upload
  const startTimer = () => {
    const startTime = Date.now();
    setTimer(setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setElapsedTime(elapsed);
    }, 100));
  };

  // File upload handler to post files to backend and handle responses
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
    setStatus('Uploading and merging Excel files...');
    setElapsedTime(0); // Reset timer
    setTimeoutError(false); // Reset timeout error flag

    startTimer(); // Start the timer

    try {
      // Send the files to the backend for processing
      const response = await axios.post('https://excel-data-merge-backend.onrender.com/api/merge', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0, // Set timeout to 0 to disable the timeout (no limit)
      });

      clearInterval(timer); // Stop the timer once upload is complete
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create a download link for the merged Excel file
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'merged_output.xlsx';
      link.click();

      setStatus(`✅ Merged file downloaded successfully in ${elapsedTime} seconds!`);
    } catch (error) {
      clearInterval(timer); // Stop the timer on error
      console.error(error);
      if (error.code === 'ECONNABORTED') {
        setTimeoutError(true);
        setStatus('❌ Request timed out. Please try again.');
      } else {
        setStatus('❌ Failed to merge Excel files from ZIPs.');
      }
    } finally {
      setLoading(false);
    }
  };

  // UseEffect hook to show alert when timeout occurs
  useEffect(() => {
    if (timeoutError) {
      alert("The request took too long. Please try again after some time.");
    }
  }, [timeoutError]);

  return (
    <div className="container mt-5">
      <div className="card p-5 shadow-lg rounded">
        <h3 className="text-center text-primary mb-4">📦 Merge ZIP Files Containing Excel Sheets</h3>

        <div className="mb-3">
          <label htmlFor="fileUpload" className="form-label">Select ZIP Files</label>
          <input
            type="file"
            className="form-control"
            multiple
            accept=".zip"
            id="fileUpload"
            onChange={handleFileChange}
          />
        </div>

        <button
          className="btn btn-success w-100"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            'Merge Excel Files from ZIPs'
          )}
        </button>

        <div className="mt-4">
          {loading && (
            <>
              <div className="progress mt-3">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${(elapsedTime / 120).toFixed(2)}%` }}
                  aria-valuenow={elapsedTime}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="text-center mt-2">
                <strong>Processing Time: </strong> {elapsedTime} seconds
              </div>
            </>
          )}

          {status && (
            <div className="alert alert-info mt-3 text-center">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
