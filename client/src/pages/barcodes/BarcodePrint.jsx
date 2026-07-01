import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCopies } from "../../hooks/useCopies";
import { usePrintData } from "../../hooks/useBarcodes";
import toast from "react-hot-toast";
import { ArrowLeft, Printer, Search, CheckSquare, Square } from "lucide-react";

const BarcodePrint = () => {
  const { data: copiesData, isLoading: loadingCopies } = useCopies();
  const printApi = usePrintData();

  const [search, setSearch] = useState("");
  const [selectedCopies, setSelectedCopies] = useState([]);
  const [printData, setPrintData] = useState([]);

  const copies = copiesData?.data || [];
  
  const filteredCopies = copies.filter(c => 
    c.copyCode.toLowerCase().includes(search.toLowerCase()) || 
    c.bookId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCopy = (id) => {
    setSelectedCopies(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCopies.length === filteredCopies.length) {
      setSelectedCopies([]);
    } else {
      setSelectedCopies(filteredCopies.map(c => c._id));
    }
  };

  const handleGeneratePrint = () => {
    if (selectedCopies.length === 0) return toast.error("Select at least one copy");
    
    printApi.mutate({ copyIds: selectedCopies }, {
      onSuccess: (res) => {
        setPrintData(res.data);
        toast.success("Print labels generated");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to generate print data")
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
      {/* Non-Printable Header UI */}
      <div className="print:hidden">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/barcodes" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Print Barcode Labels</h1>
            <p className="text-gray-600 mt-1">Select copies from inventory to generate printable labels.</p>
          </div>
        </div>

        {printData.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by Code or Book Title..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={handleSelectAll} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition flex items-center gap-2">
                  {selectedCopies.length === filteredCopies.length && filteredCopies.length > 0 ? <CheckSquare size={18}/> : <Square size={18}/>}
                  Select All
                </button>
                <button onClick={handleGeneratePrint} disabled={printApi.isLoading || selectedCopies.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center gap-2">
                  <Printer size={18} />
                  {printApi.isLoading ? "Generating..." : `Generate Labels (${selectedCopies.length})`}
                </button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {loadingCopies ? (
                <div className="p-8 text-center text-gray-500">Loading copies...</div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left w-12"></th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Copy Code</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Book Title</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredCopies.map(copy => (
                        <tr key={copy._id} onClick={() => toggleCopy(copy._id)} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-4 py-3">
                            {selectedCopies.includes(copy._id) ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-gray-400" size={18} />}
                          </td>
                          <td className="px-4 py-3 font-mono font-medium text-gray-800">{copy.copyCode}</td>
                          <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{copy.bookId?.title}</td>
                          <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded">{copy.status}</span></td>
                        </tr>
                      ))}
                      {filteredCopies.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No copies found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6 flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div>
              <h3 className="font-bold text-blue-800">Labels Generated</h3>
              <p className="text-sm text-blue-600">Ready for thermal or A4 printing.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPrintData([])} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition">Back</button>
              <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition flex items-center gap-2">
                <Printer size={18} /> Print Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable Area */}
      {printData.length > 0 && (
        <div className="print:block bg-white p-4 print:p-0 rounded-lg shadow-sm border print:border-none print:shadow-none min-h-[500px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 gap-6">
            {printData.map((data, idx) => (
              <div key={idx} className="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center text-center break-inside-avoid print:border-solid print:border-gray-800 print:p-2">
                <div className="font-bold text-[10px] mb-2 uppercase truncate w-full text-gray-600">{data.bookTitle}</div>
                <img src={data.barcodeUrl} alt={data.copyCode} className="h-16 object-contain mb-1" />
                <div className="font-mono font-bold text-sm tracking-widest">{data.copyCode}</div>
                <div className="text-[8px] text-gray-400 mt-1">LibraryOS Validated</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodePrint;
