const Book = require("../models/Book");
const axios = require("axios");

const formatISBN = (isbn) => {
  if (!isbn) return "";
  return isbn.replace(/[^0-9X]/gi, "").toUpperCase();
};

const validateISBN10 = (isbn) => {
  const cleanIsbn = formatISBN(isbn);
  if (cleanIsbn.length !== 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    if (!/^\d$/.test(cleanIsbn[i])) return false;
    sum += parseInt(cleanIsbn[i], 10) * (10 - i);
  }

  let checksum = cleanIsbn[9];
  if (checksum === 'X') {
    sum += 10;
  } else if (/^\d$/.test(checksum)) {
    sum += parseInt(checksum, 10);
  } else {
    return false;
  }

  return sum % 11 === 0;
};

const validateISBN13 = (isbn) => {
  const cleanIsbn = formatISBN(isbn);
  if (cleanIsbn.length !== 13) return false;
  if (!/^\d{13}$/.test(cleanIsbn)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(cleanIsbn[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(cleanIsbn[12], 10);
};

const validateISBN = (isbn) => {
  const cleanIsbn = formatISBN(isbn);
  if (cleanIsbn.length === 10) {
    return validateISBN10(cleanIsbn);
  }
  if (cleanIsbn.length === 13) {
    return validateISBN13(cleanIsbn);
  }
  return false;
};

const checkDuplicateISBN = async (isbn, libraryId, excludeBookId = null) => {
  const cleanIsbn = formatISBN(isbn);
  const query = { isbn: cleanIsbn, libraryId, isActive: true };
  if (excludeBookId) {
    query._id = { $ne: excludeBookId };
  }
  const exists = await Book.findOne(query);
  return !!exists;
};

const fetchBookByISBN = async (isbn) => {
  try {
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    const googleRes = await axios.get(googleBooksUrl);
    
    if (googleRes.data.items && googleRes.data.items.length > 0) {
      const volumeInfo = googleRes.data.items[0].volumeInfo;
      return {
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author",
        publisher: volumeInfo.publisher || "Unknown Publisher",
        pages: volumeInfo.pageCount || 0,
        description: volumeInfo.description || "",
        cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
        language: volumeInfo.language || "en",
        isbn: isbn
      };
    }

    const openLibraryUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`;
    const olRes = await axios.get(openLibraryUrl);
    
    const bookKey = `ISBN:${isbn}`;
    if (olRes.data && olRes.data[bookKey]) {
      const bookData = olRes.data[bookKey];
      return {
        title: bookData.title,
        author: bookData.authors ? bookData.authors.map(a => a.name).join(", ") : "Unknown Author",
        publisher: bookData.publishers ? bookData.publishers.map(p => p.name).join(", ") : "Unknown Publisher",
        pages: bookData.number_of_pages || 0,
        description: "",
        cover: bookData.cover ? bookData.cover.large : null,
        language: "en",
        isbn: isbn
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching book by ISBN:", error.message);
    return null;
  }
};

module.exports = {
  formatISBN,
  validateISBN10,
  validateISBN13,
  validateISBN,
  checkDuplicateISBN,
  fetchBookByISBN
};
