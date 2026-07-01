import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthor, useAuthorStats } from "../../hooks/useAuthors";
import { useBooks } from "../../hooks/useBooks"; // Re-using book hook for Author's books tab
import { ArrowLeft, Edit, User, Globe, Mail, MapPin, BookOpen } from "lucide-react";
import { format } from "date-fns";

const AuthorDetails = () => {
  const { id } = useParams();
  const { data: authorData, isLoading, isError } = useAuthor(id);
  const { data: statsData } = useAuthorStats(id);
  const { data: booksData } = useBooks({ author: id, limit: 100 });
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading author details...</div>;
  if (isError || !authorData?.data) return <div className="p-8 text-center text-red-500">Author not found or failed to load.</div>;

  const author = authorData.data;
  const authorBooks = booksData?.data?.books || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/authors" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Author Profile</h1>
        </div>
        <Link 
          to={`/authors/edit/${author._id}`} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Edit size={18} />
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-start border-b">
          <div className="w-32 h-32 flex-shrink-0">
            {author.image ? (
              <img src={author.image} alt={author.name} className="w-full h-full object-cover rounded-full shadow-md border-4 border-white" />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 shadow-md border-4 border-white">
                <User size={48} />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {author.country && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} /> {author.country}
                </div>
              )}
              {author.website && (
                <div className="flex items-center gap-1">
                  <Globe size={16} /> 
                  <a href={author.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{author.website}</a>
                </div>
              )}
              {author.email && (
                <div className="flex items-center gap-1">
                  <Mail size={16} /> {author.email}
                </div>
              )}
            </div>
            
            <div className="flex gap-6 mt-4">
              <div className="text-center bg-gray-50 px-4 py-2 rounded border">
                <p className="text-2xl font-bold text-blue-600">{statsData?.data?.totalBooks ?? 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Books Written</p>
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
            Biography
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About {author.name}</h3>
              {author.biography ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{author.biography}</p>
              ) : (
                <p className="text-gray-400 italic">No biography available for this author.</p>
              )}

              {author.dateOfBirth && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h4>
                  <p className="text-gray-900">{format(new Date(author.dateOfBirth), "MMMM dd, yyyy")}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'books' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Books by {author.name}</h3>
              </div>

              {authorBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {authorBooks.map(book => (
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
                  <p className="text-gray-500">No books cataloged for this author yet.</p>
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

export default AuthorDetails;
