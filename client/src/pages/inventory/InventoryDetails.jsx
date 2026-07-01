import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  useInventoryByBook, 
  useInventoryHistory,
  useAddStock,
  useRemoveStock,
  useIssueBook,
  useReturnBook,
  useReserveBook,
  useMarkDamaged,
  useMarkLost
} from "../../hooks/useInventory";
import { ArrowLeft, PackagePlus, PackageMinus, LogOut, LogIn, Bookmark, AlertTriangle, XCircle, History } from "lucide-react";
import toast from "react-hot-toast";

const InventoryDetails = () => {
  const { bookId } = useParams();
  const { data: invData, isLoading } = useInventoryByBook(bookId);
  const { data: historyData } = useInventoryHistory(bookId);
  
  const [activeTab, setActiveTab] = useState("add");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const addStock = useAddStock();
  const removeStock = useRemoveStock();
  const issueBook = useIssueBook();
  const returnBook = useReturnBook();
  const reserveBook = useReserveBook();
  const markDamaged = useMarkDamaged();
  const markLost = useMarkLost();

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading inventory details...</div>;
  if (!invData?.data) return <div className="p-8 text-center text-red-500">Inventory not found for this book.</div>;

  const inventory = invData.data;
  const book = inventory.bookId;
  const history = historyData?.data || [];

  const handleAction = (e) => {
    e.preventDefault();
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    const payload = { bookId, quantity: Number(quantity), reason };
    const options = {
      onSuccess: () => {
        toast.success("Action completed successfully");
        setQuantity(1);
        setReason("");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Action failed");
      }
    };

    switch (activeTab) {
      case "add": addStock.mutate(payload, options); break;
      case "remove": removeStock.mutate(payload, options); break;
      case "issue": issueBook.mutate(payload, options); break;
      case "return": returnBook.mutate(payload, options); break;
      case "reserve": reserveBook.mutate(payload, options); break;
      case "damaged": markDamaged.mutate(payload, options); break;
      case "lost": markLost.mutate(payload, options); break;
      default: break;
    }
  };

  const tabs = [
    { id: "add", label: "Add Stock", icon: PackagePlus, color: "text-green-600" },
    { id: "remove", label: "Remove Stock", icon: PackageMinus, color: "text-red-600" },
    { id: "issue", label: "Issue", icon: LogOut, color: "text-purple-600" },
    { id: "return", label: "Return", icon: LogIn, color: "text-blue-600" },
    { id: "reserve", label: "Reserve", icon: Bookmark, color: "text-indigo-600" },
    { id: "damaged", label: "Damaged", icon: AlertTriangle, color: "text-orange-600" },
    { id: "lost", label: "Lost", icon: XCircle, color: "text-gray-600" }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Manage Book Inventory</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Book Info & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start gap-4">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-20 object-cover rounded shadow-sm" />
            ) : (
              <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm text-center">No Cover</div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1">{book.title}</h2>
              <p className="text-sm text-gray-500 font-mono mb-2">{book.isbn}</p>
              <Link to={`/books/${book._id}`} className="text-sm text-blue-600 hover:underline">View Details</Link>
            </div>
          </div>

          <div className="bg-white p-0 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800">Current Levels</h3>
            </div>
            <div className="divide-y">
              <div className="flex justify-between p-4">
                <span className="text-gray-600">Total Copies</span>
                <span className="font-bold text-gray-900">{inventory.totalCopies}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-gray-600">Available</span>
                <span className="font-bold text-green-600">{inventory.availableCopies}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-gray-600">Issued</span>
                <span className="font-bold text-purple-600">{inventory.issuedCopies}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-gray-600">Reserved</span>
                <span className="font-bold text-indigo-600">{inventory.reservedCopies}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-gray-600">Damaged / Lost</span>
                <span className="font-bold text-red-600">{inventory.damagedCopies + inventory.lostCopies}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Actions & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex overflow-x-auto border-b hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setQuantity(1); setReason(""); }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 
                    ${activeTab === tab.id ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? tab.color : "text-gray-400"} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-6">
              <form onSubmit={handleAction} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                {["add", "remove", "damaged", "lost"].includes(activeTab) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes (Optional)</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="2"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`Why are you ${activeTab === 'add' ? 'adding' : activeTab === 'remove' ? 'removing' : 'marking'} these copies?`}
                    ></textarea>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded shadow hover:bg-blue-700 transition"
                >
                  Confirm Action
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
              <History size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-800">Recent Movement History</h3>
            </div>
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Action</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Reason</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map(record => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{new Date(record.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-800">{record.type.replace(/_/g, " ")}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{record.quantity}</td>
                        <td className="px-4 py-3 text-gray-500">{record.reason || "-"}</td>
                        <td className="px-4 py-3 text-gray-500">{record.userId?.name || "System"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No movement history for this book.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;
