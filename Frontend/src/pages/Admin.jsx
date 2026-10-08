import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Admin.css';

function Admin() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalWallets, setTotalWallets] = useState(0);
  const [failedTransactions, setFailedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, [page]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.get('/admin/total-balance'),
        api.get(`/admin/failed-transactions?page=${page}&limit=10`)
      ]);
      setTotalBalance(balanceRes.data.data.totalBalance);
      setTotalWallets(balanceRes.data.data.totalWallets);
      setFailedTransactions(transactionsRes.data.data.transactions);
      setTotalPages(transactionsRes.data.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-box">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h2>Total Balance</h2>
                <div className="stat-value">₹{totalBalance.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <h2>Total Wallets</h2>
                <div className="stat-value">{totalWallets}</div>
              </div>
            </div>

            <div className="failed-transactions-section">
              <h2>Failed Transactions</h2>
              {failedTransactions.length === 0 ? (
                <p className="no-transactions">No failed transactions</p>
              ) : (
                <>
                  <ul className="transactions-list">
                    {failedTransactions.map((tx) => (
                      <li key={tx._id} className="transaction-item failed">
                        <div className="transaction-main">
                          <div className="transaction-left">
                            <span className="transaction-type">{tx.type.toUpperCase()}</span>
                            <span className="transaction-amount">{tx.amount.toFixed(2)}</span>
                          </div>
                          <div className="transaction-right">
                            <span className="transaction-date">{new Date(tx.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {tx.type === 'transfer' && (
                          <div className="transfer-details">
                            <span>From: {tx.fromUserId?.username || 'Unknown'}</span>
                            <span>To: {tx.toUserId?.username || 'Unknown'}</span>
                          </div>
                        )}
                        <div className="failure-reason">Reason: {tx.failureReason}</div>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
