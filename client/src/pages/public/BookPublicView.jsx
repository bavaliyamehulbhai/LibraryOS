import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { usePublicQRData } from "../../hooks/useQR";
import { BookOpen, MapPin, Tag, Library, AlertCircle } from "lucide-react";

const BookPublicView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const libraryId = searchParams.get("libraryId");

  const { data: qrData, isLoading, error } = usePublicQRData(id, libraryId);

  if (!libraryId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Library Context Missing</h1>
          <p className="text-gray-500">Please scan a valid QR code directly.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="animate-pulse text-gray-500 font-medium">Loading Smart Library Data...</div>
      </div>
    );
  }

  if (error || !qrData?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Book Not Found</h1>
          <p className="text-gray-500">The scanned QR code is invalid or the copy has been removed from the catalog.</p>
        </div>
      </div>
    );
  }

  const { book, copy, location } = qrData.data;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center text-white relative">
          <Library size={32} className="mx-auto mb-2 opacity-80" />
          <h1 className="font-bold text-lg tracking-wide uppercase">Smart Library Link</h1>
          <p className="text-blue-100 text-sm mt-1">Validated Digital Record</p>
        </div>

        {/* Book Info */}
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            {book?.coverImage ? (
              <img src={book.coverImage} alt="Cover" className="w-24 rounded shadow-md object-cover" />
            ) : (
              <div className="w-24 h-36 bg-gray-200 rounded shadow-md flex items-center justify-center text-gray-400">
                <BookOpen size={32} />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{book?.title}</h2>
              <p className="text-gray-600 text-sm mb-2">{book?.author?.name || "Unknown Author"}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${copy.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {copy.status}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold border">
                  {copy.condition}
                </span>
              </div>
            </div>
          </div>

          <hr className="mb-6 border-gray-100" />

          {/* Copy Specifics */}
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Copy Identifiers</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600"><Tag size={16} /> <span className="text-sm font-medium">Copy Code</span></div>
              <span className="font-mono font-bold text-gray-900">{copy.copyCode}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600"><BookOpen size={16} /> <span className="text-sm font-medium">ISBN</span></div>
              <span className="font-mono text-gray-700">{book?.isbn}</span>
            </div>
          </div>

          {/* Location details */}
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Physical Location</h3>
          {location ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    {location.floor} &rarr; {location.section}
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    Rack {location.rack}, Shelf {location.shelf}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center text-gray-500 text-sm">
              No physical location mapped for this copy yet.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
          <p className="text-xs text-gray-400">Powered by LibraryOS Smart QR</p>
        </div>
      </div>
    </div>
  );
};

export default BookPublicView;
