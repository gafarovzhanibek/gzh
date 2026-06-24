import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { processData, validateColumns } from '../utils/processor';
import { saveData } from '../utils/storage';

export default function Upload() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | parsing | error | success
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const processFile = useCallback(async (file) => {
    setStatus('parsing');
    setProgress('Reading file...');
    setError('');

    try {
      const buffer = await file.arrayBuffer();
      setProgress('Parsing Excel...');
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setProgress('Converting rows...');
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const validation = validateColumns(rows);
      if (!validation.valid) {
        setStatus('error');
        setError(`Missing required columns: ${validation.missing.join(', ')}`);
        return;
      }

      setProgress('Processing data...');
      const processed = processData(rows);
      saveData(processed, file.name, rows.length);
      setStatus('success');
      setProgress('Done!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (e) {
      setStatus('error');
      setError(`Failed to parse file: ${e.message}`);
    }
  }, [navigate]);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) processFile(accepted[0]);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: status === 'parsing',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ONT Network Monitor</h1>
          <p className="mt-2 text-gray-500">Upload an Excel file to analyze your ONT network data</p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : status === 'error'
              ? 'border-red-400 bg-red-50'
              : status === 'parsing'
              ? 'border-indigo-300 bg-indigo-50 cursor-not-allowed'
              : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50'
          }`}
        >
          <input {...getInputProps()} />

          {status === 'idle' && (
            <>
              <div className="text-5xl mb-4">📂</div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop file here...' : 'Drag & drop Excel file here'}
              </p>
              <p className="mt-2 text-sm text-gray-400">or click to browse</p>
              <p className="mt-4 text-xs text-gray-400">.xlsx and .xls supported</p>
            </>
          )}

          {status === 'parsing' && (
            <>
              <div className="text-5xl mb-4 animate-spin">⏳</div>
              <p className="text-lg font-medium text-indigo-700">{progress}</p>
              <div className="mt-4 h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse w-3/4" />
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <p className="text-lg font-medium text-green-700">File processed! Redirecting...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <p className="text-lg font-medium text-red-700">Upload failed</p>
            </>
          )}
        </div>

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-sm text-red-600 underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs font-semibold text-gray-600 mb-2">Required columns:</p>
          <div className="flex flex-wrap gap-2">
            {['Serial Number', 'Абонент', 'OLT', 'PON Port', 'Модель'].map(col => (
              <span key={col} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
