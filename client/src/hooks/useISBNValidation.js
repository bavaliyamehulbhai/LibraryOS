import { useState, useEffect } from "react";
import api from "../services/api";

const validateIsbn10 = (isbn) => {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    if (!/^\d$/.test(isbn[i])) return false;
    sum += parseInt(isbn[i], 10) * (10 - i);
  }
  let checksum = isbn[9].toUpperCase();
  if (checksum === 'X') sum += 10;
  else if (/^\d$/.test(checksum)) sum += parseInt(checksum, 10);
  else return false;
  return sum % 11 === 0;
};

const validateIsbn13 = (isbn) => {
  if (!/^\d{13}$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(isbn[12], 10);
};

export const useISBNValidation = (isbn, currentBookId = null) => {
  const [isValid, setIsValid] = useState(null); // null = typing, false = invalid, true = valid
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isbn) {
      setIsValid(null);
      setIsDuplicate(false);
      return;
    }

    const cleanIsbn = isbn.replace(/[-\s]/g, "").toUpperCase();
    let formatValid = false;

    if (cleanIsbn.length === 10) {
      formatValid = validateIsbn10(cleanIsbn);
    } else if (cleanIsbn.length === 13) {
      formatValid = validateIsbn13(cleanIsbn);
    }

    setIsValid(formatValid);

    if (formatValid) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const response = await api.get(`/v1/books/isbn/${cleanIsbn}`);
          if (response.data?.success && response.data?.data) {
            // Found a book
            if (currentBookId && response.data.data._id === currentBookId) {
              setIsDuplicate(false); // It's the same book being edited
            } else {
              setIsDuplicate(true);
            }
          } else {
            setIsDuplicate(false);
          }
        } catch (err) {
          if (err.response?.status === 404) {
            setIsDuplicate(false); // Book not found = not duplicate
          }
        } finally {
          setIsLoading(false);
        }
      }, 500); // Debounce 500ms

      return () => clearTimeout(timer);
    } else {
      setIsDuplicate(false);
    }
  }, [isbn, currentBookId]);

  return { isValid, isDuplicate, isLoading };
};
