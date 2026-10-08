import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Form.css';

function Withdraw() {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!amount || amount <= 0) {
      setError('Amount must be greater than zero');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/wallet/withdraw', { amount: parseFloat(amount) });
      setSuccess(`Withdrawal successful! New balance: ${response.data.data.balance}`);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h1>Withdraw Money</h1>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
}

export default Withdraw;
