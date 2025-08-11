import React, { useState } from 'react';
import axios from 'axios';

export default function UploadMerge() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const onFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const upload = async () => {
    if (!files.length) return alert('Choose zip files first');
    setLoading(true);
    setProgress(0);

    const form = new FormData();
    files.forEach((f) => form.append('files', f));

    try {
      const response = await axios.post('http://localhost:4000/merge', form, {
        responseType: 'blob',
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        }
      });

      // Create and download the merged file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert('Upload or merge failed');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <h3>Upload ZIP files (each contains one Excel)</h3>
      <input type="file" accept=".zip" onChange={onFilesChange} multiple />
      <div style={{ marginTop: 8 }}>
        <button onClick={upload} disabled={loading || files.length === 0}>
          {loading ? 'Merging...' : 'Upload & Merge'}
        </button>
      </div>
      {loading && <div>Upload progress: {progress}%</div>}
      <div style={{ marginTop: 8 }}>
        {files.map((f) => (
          <div key={f.name}>{f.name} — {(f.size / 1024 / 1024).toFixed(2)} MB</div>
        ))}
      </div>
    </div>
  );
}