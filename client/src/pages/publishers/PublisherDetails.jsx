import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePublisher, usePublisherStats } from "../../hooks/usePublishers";
import { useBooks } from "../../hooks/useBooks"; 
import { ArrowLeft, Edit, Building2, Globe, Mail, Phone, MapPin, BookOpen } from "lucide-react";
import { format } from "date-fns";

const PublisherDetails = () => {
  const { id } = useParams();
  const { data: publisherData, isLoading, isError } = usePublisher(id);
  const { data: statsData } = usePublisherStats(id);
  const { data: booksData } = useBooks({ publisher: id, limit: 100 });
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading publisher details...</div>;
  if (isError || !publisherData?.data) return <div className="p-8 text-center text-red-500">Publisher not found or failed to load.</div>;

  const publisher = publisherData.data;
  const publisherBooks = booksData?.data?.books || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/publishers" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Publisher Profile</h1>
        </div>
        <Link 
          to={`/publishers/edit/${publisher._id}`} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Edit size={18} />
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-start border-b">
          <div className="w-32 h-32 flex-shrink-0">
            {publisher.logo ? (
              <img src={publisher.logo} alt={publisher.name} className="w-full h-full object-contain p-2 rounded-lg shadow-sm border bg-gray-50" />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shadow-sm border">
                <Building2 size={48} />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{publisher.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {publisher.city && publisher.country && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} /> {publisher.city}, {publisher.country}
                </div>
              )}
              {publisher.website && (
                <div className="flex items-center gap-1">
                  <Globe size={16} /> 
                  <a href={publisher.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{publisher.website}</a>
                </div>
              )}
              {publisher.email && (
                <div className="flex items-center gap-1">
                  <Mail size={16} /> {publisher.email}
                </div>
              )}
              {publisher.phone && (
                <div className="flex items-center gap-1">
                  <Phone size={16} /> {publisher.phone}
                </div>
              )}
            </div>
            
            <div className="flex gap-6 mt-4">
              <div className="text-center bg-gray-50 px-4 py-2 rounded border">
                <p className="text-2xl font-bold text-blue-600">{statsData?.data?.totalBooks ?? 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Published Books</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button 
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'books' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('books')}
          >
            Books ({statsData?.data?.totalBooks ?? 0})
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About {publisher.name}</h3>
              {publisher.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{publisher.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description available.</p>
              )}

              <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Full Address</h4>
                  <p className="text-gray-900">{publisher.address || "N/A"}</p>
                  <p className="text-gray-900">{[publisher.city, publisher.state, publisher.country].filter(Boolean).join(", ")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Added to System</h4>
                  <p className="text-gray-900">{format(new Date(publisher.createdAt), "MMMM dd, yyyy")}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Books by {publisher.name}</h3>
              </div>

              {publisherBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publisherBooks.map(book => (
                    <Link to={`/books/${book._id}`} key={book._id} className="block group">
                      <div className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition bg-white">
                        <div className="w-16 h-24 flex-shrink-0 bg-gray-100 rounded">
                          {book.coverImage && <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded shadow-sm" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">{book.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">ISBN: {book.isbn}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {book.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded border border-dashed">
                  <p className="text-gray-500">No books cataloged for this publisher yet.</p>
                  <Link to="/books/create" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Add their first book
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherDetails;
