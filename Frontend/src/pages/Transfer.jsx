import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import api from '../api/axios';
import './Transfer.css';

function Transfer() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientUser, setRecipientUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const handleRecipientSearch = async () => {
    if (!recipient) {
      setError('Please enter username or email');
      return;
    }

    setSearching(true);
    setError('');
    setRecipientUser(null);

    try {
      const response = await api.get(`/users/lookup/${recipient}`);
      setRecipientUser(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!recipientUser) {
      setError('Please select a valid recipient');
      setLoading(false);
      return;
    }

    if (!amount || amount <= 0) {
      setError('Amount must be greater than zero');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/wallet/transfer', {
        toUserId: recipientUser._id,
        amount: parseFloat(amount),
        idempotencyKey
      });
      setSuccess(`Transfer successful! Transaction ID: ${response.data.data.transaction.transactionId}`);
      setAmount('');
      setIdempotencyKey(uuidv4());
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h1>Transfer Money</h1>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Recipient (Username or Email)</label>
            <div className="recipient-search">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter username or email"
              />
              <button type="button" onClick={handleRecipientSearch} disabled={searching} className="search-btn">
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {recipientUser && (
            <div className="recipient-info">
              <p><strong>Recipient:</strong> {recipientUser.fullName} ({recipientUser.username})</p>
              <p><strong>Email:</strong> {recipientUser.email}</p>
            </div>
          )}

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

          <button type="submit" disabled={loading || !recipientUser}>
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </form>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
}

export default Transfer;
