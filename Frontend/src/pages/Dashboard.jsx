import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

function Dashboard({ user, setUser }) {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/transactions/my-transactions?page=1&limit=5')
      ]);
      setBalance(balanceRes.data.data.balance);
      setCurrency(balanceRes.data.data.currency);
      setRecentTransactions(transactionsRes.data.data.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isDebit = (tx) => {
    if (tx.type === 'withdraw') return true;
    if (tx.type === 'transfer') {
      return tx.fromUserId._id === user._id;
    }
    return false;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>PayGuard Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.fullName}</span>
          {user.role === 'admin' && <button onClick={() => navigate('/admin')} className="admin-btn">Admin Panel</button>}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="balance-card">
        <h2>Current Balance</h2>
        <div className="balance-amount">
          {currency} {balance.toFixed(2)}
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={() => navigate('/deposit')} className="action-btn deposit">Deposit</button>
        <button onClick={() => navigate('/withdraw')} className="action-btn withdraw">Withdraw</button>
        <button onClick={() => navigate('/transfer')} className="action-btn transfer">Transfer</button>
        <button onClick={() => navigate('/transactions')} className="action-btn history">View All Transactions</button>
      </div>

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <ul className="transaction-list">
            {recentTransactions.map((tx) => (
              <li key={tx._id} className={`transaction-item ${tx.status}`}>
                <div className="transaction-info">
                  <span className="transaction-type">{tx.type.toUpperCase()}</span>
                  <span className={`transaction-amount ${isDebit(tx) ? 'debit' : 'credit'}`}>
                    {isDebit(tx) ? '-' : '+'}{currency} {tx.amount.toFixed(2)}
                  </span>
                </div>
                <div className="transaction-meta">
                  <span className="transaction-status">{tx.status}</span>
                  <span className="transaction-date">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
