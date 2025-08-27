import React, { useState } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { Bid } from '../../types/bid';

const FavoritesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState('deadline');

  const { favorites, pageInfo, isLoading, error, toggleStar } = useFavorites({
    page,
    size,
    sort,
  });

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStarToggle = (bidId: string) => {
    toggleStar.mutate(bidId);
  };

  if (isLoading) return <div>Loading favorites...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>내 즐겨찾기</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <select
          value={sort}
          onChange={handleSortChange}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="title">Sort by Title</option>
          <option value="budget">Sort by Budget</option>
        </select>
      </div>

      {favorites.length === 0 ? (
        <p>즐겨찾기한 공고가 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Organization</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Budget</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Deadline</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Starred</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((bid) => (
              <tr key={bid.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{bid.title}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{bid.org}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{bid.budget.toLocaleString()}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{bid.deadline}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <span
                    onClick={() => handleStarToggle(bid.id)}
                    style={{ cursor: 'pointer', color: bid.starred ? 'gold' : 'gray', fontSize: '24px' }}
                  >
                    ★
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pageInfo && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 15px' }}>
            Page {page} of {Math.ceil(pageInfo.total / pageInfo.size)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page * size >= pageInfo.total}
            style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;