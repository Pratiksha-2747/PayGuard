import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Transactions.css';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();
    fetchTransactions(page);
  }, [page]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchTransactions = async (pageNum) => {
    setLoading(true);
    try {
      const response = await api.get(`/transactions/my-transactions?page=${pageNum}&limit=10`);
      setTransactions(response.data.data.transactions);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const isDebit = (tx) => {
    if (tx.type === 'deposit') return false;
    if (tx.type === 'withdraw') return true;
    if (tx.type === 'transfer') {
      return tx.fromUserId?._id === currentUser?._id;
    }
    return false;
  };

  return (
    <div className="transactions-container">
      <div className="transactions-box">
        <div className="transactions-header">
          <h1>Transaction History</h1>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : transactions.length === 0 ? (
          <p className="no-transactions">No transactions found</p>
        ) : (
          <>
            <ul className="transactions-list">
              {transactions.map((tx) => (
                <li key={tx._id} className={`transaction-item ${tx.status}`}>
                  <div className="transaction-main">
                    <div className="transaction-left">
                      <span className="transaction-type">{tx.type.toUpperCase()}</span>
                      <span className={`transaction-amount ${isDebit(tx) ? 'debit' : 'credit'}`}>
                        {isDebit(tx) ? '-' : '+'}{tx.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="transaction-right">
                      <span className={`transaction-status ${tx.status}`}>{tx.status}</span>
                      <span className="transaction-date">{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {tx.type === 'transfer' && (
                    <div className="transfer-details">
                      <span>From: {tx.fromUserId?.username || 'Unknown'}</span>
                      <span>To: {tx.toUserId?.username || 'Unknown'}</span>
                    </div>
                  )}
                  {tx.failureReason && (
                    <div className="failure-reason">Reason: {tx.failureReason}</div>
                  )}
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Transactions;
