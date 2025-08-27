import React, { useState } from 'react';
import { Bid, PageInfo } from '../../types/bid';
import { useBids } from '../../hooks/useBids';

interface BidTableProps {
  initialKeyword?: string;
  initialPage?: number;
  initialSize?: number;
  initialSort?: string;
}

const BidTable: React.FC<BidTableProps> = ({
  initialKeyword = '',
  initialPage = 1,
  initialSize = 10,
  initialSort = 'deadline',
}) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState(initialSort);

  const { bids, pageInfo, isLoading, error, toggleStar } = useBids({
    keyword,
    page,
    size,
    sort,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1); // Reset to first page on new sort
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStarToggle = (bidId: string) => {
    toggleStar.mutate(bidId);
  };

  if (isLoading) return <div>Loading bids...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search bids..."
          value={keyword}
          onChange={handleSearchChange}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flexGrow: 1 }}
        />
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

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Title</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Organization</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Budget</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Deadline</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Starred</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Downloaded</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => (
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
              <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                {bid.downloaded ? '✅' : '❌'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default BidTable;