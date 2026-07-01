exports.detectIntent = (query) => {
  const normalizedQuery = query.toLowerCase();

  // Overdue Books
  if (normalizedQuery.includes("overdue") && normalizedQuery.includes("book")) {
    return "GET_OVERDUE_BOOKS";
  }

  // Active / Total Members
  if (normalizedQuery.includes("member") && (normalizedQuery.includes("active") || normalizedQuery.includes("total"))) {
    return "GET_MEMBERS_SUMMARY";
  }

  // Analytics / Revenue
  if (normalizedQuery.includes("revenue") || normalizedQuery.includes("analytics") || normalizedQuery.includes("growth")) {
    return "GET_ANALYTICS";
  }

  // Books / Catalog
  if (normalizedQuery.includes("book") && (normalizedQuery.includes("available") || normalizedQuery.includes("show"))) {
    return "GET_BOOKS_SUMMARY";
  }

  // Fines
  if (normalizedQuery.includes("fine") || normalizedQuery.includes("penalty")) {
    return "GET_FINES_SUMMARY";
  }

  // Support / Tickets
  if (normalizedQuery.includes("ticket") || normalizedQuery.includes("support")) {
    return "GET_TICKETS_SUMMARY";
  }

  // Branch
  if (normalizedQuery.includes("branch") || normalizedQuery.includes("branches")) {
    return "GET_BRANCHES_SUMMARY";
  }

  // Default / Unknown
  return "UNKNOWN_INTENT";
};
