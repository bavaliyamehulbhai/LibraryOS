import React from "react";
import { useParams, Link } from "react-router-dom";
import { useBook } from "../../hooks/useBooks";
import { ArrowLeft, Edit } from "lucide-react";

const BookDetails = () => {
  const { id } = useParams();
  const { data: bookData, isLoading, isError } = useBook(id);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading book details...</div>;
  if (isError || !bookData?.data) return <div className="p-8 text-center text-red-500">Book not found or failed to load.</div>;

  const book = bookData.data;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/books" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Book Details</h1>
        </div>
        <Link 
          to={`/books/edit/${book._id}`} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Edit size={18} />
          Edit Book
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/3 bg-gray-50 p-8 flex justify-center items-center border-r border-gray-200">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full max-w-xs object-cover rounded shadow-md" />
          ) : (
            <div className="w-full max-w-xs aspect-[2/3] bg-gray-200 rounded flex items-center justify-center text-gray-400 shadow-md">
              No Cover Available
            </div>
          )}
        </div>
        
        <div className="md:w-2/3 p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h2>
            {book.subtitle && <p className="text-xl text-gray-600">{book.subtitle}</p>}
            <div className="mt-4 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {book.status}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 border-t border-b py-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">ISBN</p>
              <p className="font-medium text-gray-900">{book.isbn}</p>
            </div>
            {book.author && (
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <Link to={`/authors/${book.author._id}`} className="font-medium text-blue-600 hover:underline">{book.author.name}</Link>
              </div>
            )}
            {book.publisher && (
              <div>
                <p className="text-sm text-gray-500">Publisher</p>
                <Link to={`/publishers/${book.publisher._id}`} className="font-medium text-blue-600 hover:underline">{book.publisher.name}</Link>
              </div>
            )}
            {book.category && (
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <Link to={`/categories/${book.category._id}`} className="font-medium text-purple-600 hover:underline">{book.category.name}</Link>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Language</p>
              <p className="font-medium text-gray-900">{book.language}</p>
            </div>
            {book.publicationYear && (
              <div>
                <p className="text-sm text-gray-500">Publication Year</p>
                <p className="font-medium text-gray-900">{book.publicationYear}</p>
              </div>
            )}
            {book.pages && (
              <div>
                <p className="text-sm text-gray-500">Pages</p>
                <p className="font-medium text-gray-900">{book.pages}</p>
              </div>
            )}
          </div>

          {book.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{book.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
