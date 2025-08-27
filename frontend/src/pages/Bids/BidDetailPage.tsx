import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useBidDetail } from '../../hooks/useBidDetail';

const BidDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bidDetail, isLoading, error, toggleStar } = useBidDetail();

  const [isConverting, setIsConverting] = useState<{ [key: number]: boolean }>({});
  const [conversionError, setConversionError] = useState<{ [key: number]: string | null }>({});

  const handleHwpDownload = async (fileId: number, originalFilename: string) => {
    setIsConverting(prev => ({ ...prev, [fileId]: true }));
    setConversionError(prev => ({ ...prev, [fileId]: null }));

    try {
      const response = await axios.post(`/api/files/${fileId}/convert-hwp`);
      const { convertedFilePath } = response.data;

      if (convertedFilePath) {
        const filename = convertedFilePath.split(/[\/]/).pop(); // Extract filename from path
        if (filename) {
          window.open(`/api/files/converted/${filename}`, '_blank');
        } else {
          throw new Error('Converted filename not found.');
        }
      } else {
        throw new Error('Converted file path not returned.');
      }
    } catch (err: any) {
      console.error('HWP conversion failed:', err);
      setConversionError(prev => ({ ...prev, [fileId]: err.response?.data?.message || err.message || 'Unknown error' }));
    } finally {
      setIsConverting(prev => ({ ...prev, [fileId]: false }));
    }
  };

  if (isLoading) return <div>Loading bid details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!bidDetail) return <div>Bid not found.</div>;

  const handleStarToggle = () => {
    if (id) {
      toggleStar.mutate(id);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '10px' }}>{bidDetail.title}</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        기관: {bidDetail.org} | 예산: {bidDetail.budget.toLocaleString()} | 마감일: {bidDetail.deadline}
      </p>

      <div style={{ marginBottom: '20px' }}>
        <span
          onClick={handleStarToggle}
          style={{ cursor: 'pointer', color: bidDetail.starred ? 'gold' : 'gray', fontSize: '30px', marginRight: '10px' }}
        >
          ★
        </span>
        <span style={{
          padding: '5px 10px',
          borderRadius: '5px',
          backgroundColor: bidDetail.downloaded ? '#d4edda' : '#f8d7da',
          color: bidDetail.downloaded ? '#155724' : '#721c24',
          fontWeight: 'bold',
        }}>
          {bidDetail.downloaded ? '다운로드 완료' : '다운로드 필요'}
        </span>
      </div>

      <div style={{ marginBottom: '30px', lineHeight: '1.6' }}>
        <h3>공고 내용</h3>
        <p>{bidDetail.body}</p>
      </div>

      {bidDetail.files && bidDetail.files.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>첨부파일</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {bidDetail.files.map((file, index) => (
              <li key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px', color: '#007bff', textDecoration: 'none' }}>
                  {file.name}
                </a>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontSize: '0.8em',
                  backgroundColor: file.status === 'uploaded' ? '#e2e3e5' : file.status === 'processing' ? '#fff3cd' : '#f8d7da',
                  color: file.status === 'uploaded' ? '#383d41' : file.status === 'processing' ? '#856404' : '#721c24',
                }}>
                  {file.status}
                </span>
                <button
                  onClick={() => window.open(file.url, '_blank')}
                  style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  원본 다운로드
                </button>
                <button
                  onClick={() => handleHwpDownload(file.id, file.original_filename)}
                  style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  disabled={isConverting[file.id]}
                >
                  {isConverting[file.id] ? '변환 중...' : 'HWP 변환 다운로드'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bidDetail.meta && Object.keys(bidDetail.meta).length > 0 && (
        <div>
          <h3>메타 정보</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(bidDetail.meta).map(([key, value]) => (
              <li key={key} style={{ marginBottom: '5px' }}>
                <strong>{key}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BidDetailPage;