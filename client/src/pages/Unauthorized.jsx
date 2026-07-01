import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>Access Denied</h1>
      <p style={{ marginBottom: '2rem' }}>You do not have permission to view this page.</p>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
