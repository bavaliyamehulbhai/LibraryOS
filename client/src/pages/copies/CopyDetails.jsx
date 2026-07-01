import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  useCopy, 
  useCopyHistory,
  useIssueCopy,
  useReturnCopy,
  useReserveCopy,
  useMarkLost,
  useMarkDamaged,
  useUpdateCondition
} from "../../hooks/useCopies";
import { ArrowLeft, Tag, Barcode, QrCode, Activity, History, PackageOpen } from "lucide-react";
import toast from "react-hot-toast";

const CopyDetails = () => {
  const { id } = useParams();
  const { data: copyData, isLoading: loadingCopy } = useCopy(id);
  const { data: historyData, isLoading: loadingHistory } = useCopyHistory(id);

  const [condition, setCondition] = useState("");
  const [remarks, setRemarks] = useState("");

  const issueCopy = useIssueCopy();
  const returnCopy = useReturnCopy();
  const reserveCopy = useReserveCopy();
  const markLost = useMarkLost();
  const markDamaged = useMarkDamaged();
  const updateCondition = useUpdateCondition();

  if (loadingCopy) return <div className="p-8 text-center text-gray-500">Loading copy details...</div>;
  if (!copyData?.data) return <div className="p-8 text-center text-red-500">Copy not found.</div>;

  const copy = copyData.data;
  const history = historyData?.data || [];
  const book = copy.bookId;

  const handleAction = (action) => {
    const payload = { copyId: id, remarks };
    const options = {
      onSuccess: () => {
        toast.success(`Successfully executed ${action}`);
        setRemarks("");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || `Failed to execute ${action}`);
      }
    };

    switch(action) {
      case "ISSUE": issueCopy.mutate(payload, options); break;
      case "RETURN": returnCopy.mutate(payload, options); break;
      case "RESERVE": reserveCopy.mutate(payload, options); break;
      case "LOST": markLost.mutate(payload, options); break;
      case "DAMAGED": markDamaged.mutate(payload, options); break;
      default: break;
    }
  };

  const handleConditionChange = (e) => {
    e.preventDefault();
    if (!condition) return;
    
    updateCondition.mutate({ id, data: { condition } }, {
      onSuccess: () => {
        toast.success("Condition updated successfully");
        setCondition("");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to update condition")
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/copies" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Copy Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-6">
              {book?.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-32 object-cover rounded shadow-md" />
              ) : (
                <div className="w-32 h-44 bg-gray-200 rounded flex items-center justify-center text-gray-400">No Cover</div>
              )}
            </div>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{book?.title || "Unknown Book"}</h2>
              <p className="text-sm text-gray-500 font-mono mb-2">{book?.isbn}</p>
              <Link to={`/books/${book?._id}`} className="text-sm text-blue-600 hover:underline">View Book Details</Link>
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Tag size={14}/> Copy Code</span>
                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{copy.copyCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Activity size={14}/> Status</span>
                <span className="font-semibold text-sm">{copy.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><PackageOpen size={14}/> Condition</span>
                <span className="font-semibold text-sm">{copy.condition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Barcode size={14}/> Barcode</span>
                <span className="text-sm text-gray-600 font-mono">{copy.barcode || "Not Assigned"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><QrCode size={14}/> QR Code</span>
                <span className="text-sm text-gray-600 font-mono">{copy.qrCode || "Not Assigned"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Actions & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Operational Controls</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <button onClick={() => handleAction("ISSUE")} disabled={copy.status !== 'AVAILABLE'} className="bg-purple-100 text-purple-700 font-medium py-2 rounded hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition">Issue</button>
              <button onClick={() => handleAction("RETURN")} disabled={copy.status !== 'ISSUED'} className="bg-green-100 text-green-700 font-medium py-2 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition">Return</button>
              <button onClick={() => handleAction("RESERVE")} disabled={copy.status !== 'AVAILABLE'} className="bg-indigo-100 text-indigo-700 font-medium py-2 rounded hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition">Reserve</button>
              <button onClick={() => handleAction("LOST")} disabled={copy.status !== 'AVAILABLE'} className="bg-gray-100 text-gray-700 font-medium py-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition">Mark Lost</button>
              <button onClick={() => handleAction("DAMAGED")} disabled={copy.status !== 'AVAILABLE'} className="col-span-2 md:col-span-4 bg-red-100 text-red-700 font-medium py-2 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition">Mark Damaged</button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Remarks (Optional)</label>
              <input 
                type="text" 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                placeholder="Added condition notes or reasons..." 
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <form onSubmit={handleConditionChange} className="border-t pt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-2">Update Condition Manually</h4>
              <div className="flex gap-2">
                <select 
                  className="flex-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="">Select Condition...</option>
                  <option value="NEW">New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
                <button type="submit" disabled={!condition} className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition">Update</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
              <History size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-800">Copy Movement History</h3>
            </div>
            {loadingHistory ? (
              <div className="p-8 text-center text-gray-500">Loading history...</div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full whitespace-nowrap text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Action</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">User</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map(record => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-800 text-xs bg-gray-100 px-2 py-1 rounded">
                            {record.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{record.userId?.name || "System"}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate" title={record.remarks}>{record.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No movement history for this copy.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyDetails;
