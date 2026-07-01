const readerService = require("../services/readerService");
const ReaderNote = require("../models/ReaderNote");
const ReadingHistory = require("../models/ReadingHistory");

exports.addNote = async (req, res) => {
  try {
    const { resourceId, pageNumber, noteText, selectedText, color } = req.body;
    
    const newNote = await ReaderNote.create({
      libraryId: req.user.libraryId,
      userId: req.user._id,
      resourceId,
      pageNumber,
      noteText,
      selectedText,
      color
    });

    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await ReaderNote.find({
      libraryId: req.user.libraryId,
      userId: req.user._id,
      resourceId: req.params.resourceId
    }).sort({ pageNumber: 1 });
    
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { resourceId, pageNumber } = req.body;
    
    let history = await ReadingHistory.findOne({
      libraryId: req.user.libraryId,
      userId: req.user._id,
      resourceId
    });

    if (!history) {
      history = await ReadingHistory.create({
        libraryId: req.user.libraryId,
        userId: req.user._id,
        resourceId,
        bookmarks: [pageNumber]
      });
    } else {
      const idx = history.bookmarks.indexOf(pageNumber);
      if (idx > -1) {
        history.bookmarks.splice(idx, 1);
      } else {
        history.bookmarks.push(pageNumber);
      }
      await history.save();
    }

    res.json({ success: true, data: history.bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Features
exports.explainConcept = async (req, res) => {
  try {
    const { selectedText } = req.body;
    const explanation = await readerService.explainConcept(selectedText);
    res.json({ success: true, data: explanation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.summarizeChapter = async (req, res) => {
  try {
    const { text } = req.body;
    const summary = await readerService.summarizeChapter(text);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
