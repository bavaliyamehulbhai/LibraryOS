import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Barcode, Search, AlertCircle, CheckCircle, Package, SearchX, Flag, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { confirmAlert } from '../../utils/confirmAlert';

const ActiveAudit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState('');
  
  const [barcode, setBarcode] = useState('');
  const [condition, setCondition] = useState('GOOD');
  
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    fetchAuditDetails();
    fetchShelves();
  }, [id]);

  // Keep focus on barcode input for fast scanning
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [selectedShelf, condition]);

  const fetchAuditDetails = async () => {
    try {
      const res = await api.get(`/v1/inventory-audit/${id}`);
      if (res.data.success) {
        setSession(res.data.data.session);
        setRecords(res.data.data.records);
      }
    } catch (error) {
      toast.error('Failed to load audit session');
      navigate('/inventory/audit');
    } finally {
      setLoading(false);
    }
  };

  const fetchShelves = async () => {
    try {
      const res = await api.get('/v1/locations');
      if (res.data.success) {
        setShelves(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim() || !selectedShelf) {
      if (!selectedShelf) toast.error('Please select a shelf first');
      return;
    }

    setScanning(true);
    try {
      const res = await api.post(`/v1/inventory-audit/${id}/scan`, {
        barcode: barcode.trim(),
        shelfId: selectedShelf,
        condition
      });
      
      if (res.data.success) {
        toast.success(`Scanned: ${barcode}`);
        setBarcode('');
        fetchAuditDetails(); // Refresh list silently
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Scan failed');
    } finally {
      setScanning(false);
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    }
  };

  const handleCompleteShelf = async () => {
    if (!selectedShelf) return;
    const confirm = await confirmAlert("Are you sure? This will mark all unscanned books on this shelf as MISSING.");
    if (!confirm) return;

    try {
      const res = await api.post(`/v1/inventory-audit/${id}/complete-shelf`, { shelfId: selectedShelf });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAuditDetails();
        setSelectedShelf(''); // Prompt them to pick the next shelf
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete shelf');
    }
  };

  const handleCloseSession = async () => {
    const confirm = await confirmAlert("Are you sure you want to finish this entire audit session? You won't be able to scan more books.");
    if (!confirm) return;

    try {
      const res = await api.post(`/v1/inventory-audit/${id}/close`);
      if (res.data.success) {
        toast.success('Audit session completed!');
        navigate('/inventory/audit');
      }
    } catch (error) {
      toast.error('Failed to close session');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading audit data...</div>;
  if (!session) return <div className="p-8 text-center text-red-500">Session not found</div>;

  const isActive = session.status === 'IN_PROGRESS';

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Scanning Interface */}
      <div className="w-full lg:w-1/3 space-y-6">
        
        {/* Session Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{session.name}</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
              isActive ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'
            }`}>
              {session.status}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(session.startDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{session.totalScanned}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Scanned</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{session.totalMissing}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Missing</div>
            </div>
          </div>
        </div>

        {/* Scanner Box */}
        {isActive && (
          <div className="bg-blue-600 rounded-xl p-5 shadow-lg text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Barcode className="w-5 h-5" />
              Scanner Module
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Current Shelf</label>
                <select 
                  value={selectedShelf}
                  onChange={(e) => setSelectedShelf(e.target.value)}
                  className="w-full px-3 py-2 bg-blue-700 border border-blue-500 rounded-lg text-white outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="">-- Select a Shelf to Audit --</option>
                  {shelves.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {selectedShelf && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Book Condition</label>
                    <select 
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-blue-700 border border-blue-500 rounded-lg text-white outline-none focus:ring-2 focus:ring-white"
                    >
                      <option value="NEW">New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                  </div>

                  <form onSubmit={handleScan}>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Scan Barcode</label>
                    <div className="relative">
                      <input
                        ref={barcodeInputRef}
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Scan or type barcode..."
                        disabled={scanning}
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 font-mono text-lg outline-none focus:ring-2 focus:ring-blue-300"
                        autoFocus
                      />
                      <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                    <button type="submit" className="hidden">Submit</button>
                  </form>
                  
                  <div className="pt-4 border-t border-blue-500/50 mt-4">
                    <button
                      type="button"
                      onClick={handleCompleteShelf}
                      className="w-full py-2 bg-white text-blue-700 hover:bg-gray-50 rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Mark Shelf as Complete
                    </button>
                    <p className="text-xs text-blue-200 mt-2 text-center">
                      Clicking this will mark any unscanned books on this shelf as MISSING.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isActive && (
          <button
            onClick={handleCloseSession}
            className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            Finish & Close Entire Audit
          </button>
        )}
      </div>

      {/* Right Column: Scanned Records */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-120px)]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-500" />
            Audit Log
          </h3>
          <span className="text-sm font-medium text-gray-500">{records.length} records</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <SearchX className="w-12 h-12 mb-2 opacity-50" />
              <p>No books scanned yet in this session.</p>
            </div>
          ) : (
            records.slice().reverse().map(record => (
              <div key={record._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                
                <div className="pt-1">
                  {record.status === 'VERIFIED' && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {record.status === 'MISSING' && <SearchX className="w-6 h-6 text-red-500" />}
                  {record.status === 'MISPLACED' && <Flag className="w-6 h-6 text-orange-500" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {record.bookCopyId?.bookId?.title || 'Unknown Title'}
                    </h4>
                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                      {record.bookCopyId?.barcode || record.bookCopyId?.copyCode}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Condition: 
                      <span className={`ml-1 font-medium ${record.condition === 'DAMAGED' || record.condition === 'POOR' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {record.condition}
                      </span>
                    </span>
                    
                    {record.status === 'MISPLACED' ? (
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        Expected: {record.expectedShelfId?.name || 'Unknown'} → Scanned at: {record.scannedShelfId?.name || 'Unknown'}
                      </span>
                    ) : record.status === 'MISSING' ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Missing from: {record.expectedShelfId?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span>Shelf: {record.scannedShelfId?.name || 'Unknown'}</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2">
                    Scanned at: {new Date(record.scannedAt || record.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ActiveAudit;
