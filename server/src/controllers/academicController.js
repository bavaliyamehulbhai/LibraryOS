const ResearchPaper = require("../models/ResearchPaper");
const axios = require("axios");

// Fetch metadata from Crossref API via DOI
exports.fetchCrossrefMetadata = async (req, res) => {
  try {
    const { doi } = req.body;
    if (!doi) {
      return res.status(400).json({ success: false, message: "DOI is required" });
    }

    // Clean DOI (remove url parts if user pasted full URL)
    let cleanDoi = doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").trim();

    // Crossref API Endpoint
    const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
    
    // Add polite mailto header as requested by Crossref guidelines (optional but recommended)
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "LibraryOS/1.0 (mailto:admin@libraryos.com)"
      }
    });

    const data = response.data.message;

    // Parse necessary fields
    const title = data.title ? data.title[0] : "";
    const abstract = data.abstract ? data.abstract.replace(/(<([^>]+)>)/gi, "") : ""; // Strip HTML tags
    const publisher = data.publisher || "";
    const publicationYear = data.published?.['date-parts']?.[0]?.[0] || data.created?.['date-parts']?.[0]?.[0] || new Date().getFullYear();
    const citations = data['is-referenced-by-count'] || 0;
    
    // Extract authors
    const authors = data.author ? data.author.map(a => `${a.given || ""} ${a.family || ""}`.trim()) : [];
    
    // Extract keywords (subjects)
    const keywords = data.subject || [];

    const formattedData = {
      doi: cleanDoi,
      title,
      abstract,
      authors,
      publisher,
      publicationYear,
      citations,
      keywords,
      url: data.URL
    };

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Crossref API Error:", error.message);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ success: false, message: "DOI not found in Crossref database" });
    }
    res.status(500).json({ success: false, message: "Failed to fetch metadata from Crossref" });
  }
};

// Generate BibTeX for a specific paper in our database
exports.generateBibtex = async (req, res) => {
  try {
    const { id } = req.params;
    const libraryId = req.user.libraryId;

    const paper = await ResearchPaper.findOne({ _id: id, libraryId });
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    // Map our internal researchType to BibTeX types
    let type = "article";
    if (paper.researchType === "THESIS" || paper.researchType === "DISSERTATION") type = "phdthesis";
    if (paper.researchType === "BOOK_CHAPTER") type = "inbook";
    if (paper.researchType === "CONFERENCE_PAPER") type = "inproceedings";

    // Generate BibTeX key (FirstAuthorLastNameYear)
    let bibKey = "Unknown" + paper.publicationYear;
    if (paper.authors && paper.authors.length > 0) {
      const firstAuthor = paper.authors[0];
      const lastName = firstAuthor.split(" ").pop();
      bibKey = lastName + paper.publicationYear;
    }

    let bibtex = `@${type}{${bibKey},\n`;
    bibtex += `  title={${paper.title}},\n`;
    if (paper.authors && paper.authors.length > 0) {
      bibtex += `  author={${paper.authors.join(" and ")}},\n`;
    }
    bibtex += `  year={${paper.publicationYear}},\n`;
    if (paper.publisher) bibtex += `  publisher={${paper.publisher}},\n`;
    if (paper.doi) bibtex += `  doi={${paper.doi}},\n`;
    if (paper.fileUrl) bibtex += `  url={${paper.fileUrl}}\n`;
    bibtex += `}`;

    res.json({ success: true, data: { bibtex } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
