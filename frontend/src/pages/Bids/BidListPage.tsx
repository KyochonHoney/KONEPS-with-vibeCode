import React from 'react';
import BidTable from '../../components/bids/BidTable';

const BidListPage: React.FC = () => {
  return (
    <div>
      <h2>공고 리스트</h2>
      <BidTable />
    </div>
  );
};

export default BidListPage;