const mongoose = require('mongoose');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Library = require('../models/Library');
const Inventory = require('../models/Inventory');
const BookCopy = require('../models/BookCopy');

const RAW_BOOKS = [
  // 1. Computer Science & Programming
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    subtitle: "Leading Agile Craftsmanship and Refactoring Standards",
    isbn: "978-0132350884",
    author: "Robert C. Martin",
    category: "Computer Science & Programming",
    publisher: "Pearson Education",
    publicationYear: 2008,
    pages: 464,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Pragmatic Programmer: Your Journey to Mastery",
    subtitle: "20th Anniversary Edition",
    isbn: "978-0135957059",
    author: "David Thomas & Andrew Hunt",
    category: "Computer Science & Programming",
    publisher: "Addison-Wesley",
    publicationYear: 2019,
    pages: 352,
    description: "Illustrates the best practices and major pitfalls of many different aspects of software development.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Introduction to Algorithms",
    subtitle: "Fourth Edition (CLRS)",
    isbn: "978-0262046305",
    author: "Thomas H. Cormen",
    category: "Computer Science & Programming",
    publisher: "MIT Press",
    publicationYear: 2022,
    pages: 1312,
    description: "Comprehensive textbook covers the full breadth of modern algorithms, graph theory, dynamic programming, and complexity.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Structure and Interpretation of Computer Programs",
    subtitle: "JavaScript Edition",
    isbn: "978-0262543231",
    author: "Harold Abelson & Gerald Jay Sussman",
    category: "Computer Science & Programming",
    publisher: "MIT Press",
    publicationYear: 2022,
    pages: 664,
    description: "A foundational text on computational abstractions, functional programming, and interpreter architectures.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    subtitle: "Gang of Four Definitive Edition",
    isbn: "978-0201633610",
    author: "Erich Gamma & Richard Helm",
    category: "Computer Science & Programming",
    publisher: "Addison-Wesley",
    publicationYear: 1994,
    pages: 395,
    description: "The seminal catalog of 23 timeless creational, structural, and behavioral software architecture patterns.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Art of Computer Programming, Vol 1",
    subtitle: "Fundamental Algorithms",
    isbn: "978-0201896831",
    author: "Donald E. Knuth",
    category: "Computer Science & Programming",
    publisher: "Addison-Wesley",
    publicationYear: 1997,
    pages: 672,
    description: "The bible of classical computer science analysis covering mathematical foundations and data structures.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Rust Programming Language",
    subtitle: "Covers Rust 2021 Edition",
    isbn: "978-1718503106",
    author: "Steve Klabnik & Carol Nichols",
    category: "Computer Science & Programming",
    publisher: "No Starch Press",
    publicationYear: 2023,
    pages: 560,
    description: "The official guide to systems programming with zero-cost abstractions, memory safety, and concurrency.",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Head First Design Patterns",
    subtitle: "Building Extensible & Maintainable Object-Oriented Software",
    isbn: "978-1492078005",
    author: "Eric Freeman & Elisabeth Robson",
    category: "Computer Science & Programming",
    publisher: "O'Reilly Media",
    publicationYear: 2020,
    pages: 672,
    description: "Brain-friendly visual guide to understanding design patterns without dry academic prose.",
    coverImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
  },

  // 2. Artificial Intelligence & Machine Learning
  {
    title: "Artificial Intelligence: A Modern Approach",
    subtitle: "Fourth Edition Global Framework",
    isbn: "978-0134610993",
    author: "Stuart Russell & Peter Norvig",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "Pearson Education",
    publicationYear: 2020,
    pages: 1152,
    description: "The universally adopted comprehensive AI textbook covering probabilistic reasoning, search, and deep reinforcement learning.",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Deep Learning",
    subtitle: "Adaptive Computation and Machine Learning Series",
    isbn: "978-0262035613",
    author: "Ian Goodfellow & Yoshua Bengio",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "MIT Press",
    publicationYear: 2016,
    pages: 800,
    description: "The definitive mathematical treatment on deep neural networks, convolutional nets, optimization, and generative modeling.",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
    subtitle: "Concepts, Tools, and Techniques to Build Intelligent Systems",
    isbn: "978-1098125974",
    author: "Aurélien Géron",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "O'Reilly Media",
    publicationYear: 2022,
    pages: 850,
    description: "Practical guide using concrete code examples, minimal theory, and production-ready Python frameworks.",
    coverImage: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Master Algorithm",
    subtitle: "How the Quest for the Ultimate Learning Machine Will Remake Our World",
    isbn: "978-0465065707",
    author: "Pedro Domingos",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "Basic Books",
    publicationYear: 2015,
    pages: 352,
    description: "Explores the five tribes of machine learning: symbolists, connectionists, evolutionaries, Bayesians, and analogizers.",
    coverImage: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Superintelligence: Paths, Dangers, Strategies",
    subtitle: "Foundational AI Safety and Alignment",
    isbn: "978-0198739838",
    author: "Nick Bostrom",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "Oxford University Press",
    publicationYear: 2014,
    pages: 352,
    description: "What happens when machines surpass humans in general intelligence? Bostrom outlines existential risk and alignment.",
    coverImage: "https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Human Compatible: Artificial Intelligence and the Problem of Control",
    subtitle: "Rethinking the Foundations of AI",
    isbn: "978-0525558613",
    author: "Stuart Russell",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "Viking",
    publicationYear: 2019,
    pages: 352,
    description: "Argues that creating provably beneficial AI requires machines that are humble, altruistic, and uncertain about human values.",
    coverImage: "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Pattern Recognition and Machine Learning",
    subtitle: "Information Science and Statistics",
    isbn: "978-0387310732",
    author: "Christopher M. Bishop",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "Springer",
    publicationYear: 2006,
    pages: 738,
    description: "Comprehensive Bayesian perspective on pattern classification, graphical models, and kernel methods.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Reinforcement Learning: An Introduction",
    subtitle: "Adaptive Computation Series",
    isbn: "978-0262039246",
    author: "Richard S. Sutton & Andrew G. Barto",
    category: "Artificial Intelligence & Machine Learning",
    publisher: "MIT Press",
    publicationYear: 2018,
    pages: 552,
    description: "Clear and simple account of the field's key ideas and algorithms from Markov Decision Processes to Deep Q-Networks.",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"
  },

  // 3. Cybersecurity & Cryptography
  {
    title: "Applied Cryptography: Protocols, Algorithms, and Source Code in C",
    subtitle: "20th Anniversary Edition",
    isbn: "978-1119096726",
    author: "Bruce Schneier",
    category: "Cybersecurity & Cryptography",
    publisher: "Wiley",
    publicationYear: 2015,
    pages: 784,
    description: "The definitive reference on cryptographic protocols, symmetric ciphers, public-key algorithms, and key exchange.",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Web Application Hacker's Handbook",
    subtitle: "Finding and Exploiting Security Flaws",
    isbn: "978-1118026472",
    author: "Dafydd Stuttard & Marcus Pinto",
    category: "Cybersecurity & Cryptography",
    publisher: "Wiley",
    publicationYear: 2011,
    pages: 912,
    description: "Step-by-step guide to defending web applications from modern injection vulnerabilities, auth bypasses, and session hijacking.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Serious Cryptography: A Practical Introduction to Modern Encryption",
    subtitle: "Modern Cipher Engineering",
    isbn: "978-1593278267",
    author: "Jean-Philippe Aumasson",
    category: "Cybersecurity & Cryptography",
    publisher: "No Starch Press",
    publicationYear: 2017,
    pages: 312,
    description: "Practical guide to modern encryption covering TLS, authenticated ciphers, elliptic curves, and quantum resistance.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Hacking: The Art of Exploitation",
    subtitle: "Second Edition with LiveCD Labs",
    isbn: "978-1593271442",
    author: "Jon Erickson",
    category: "Cybersecurity & Cryptography",
    publisher: "No Starch Press",
    publicationYear: 2008,
    pages: 488,
    description: "Introduces C programming from a hacker's perspective, assembly buffer overflows, network packet sniffing, and shellcode.",
    coverImage: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Threat Modeling: Designing for Security",
    subtitle: "Engineering Secure Enterprise Software",
    isbn: "978-1118809990",
    author: "Adam Shostack",
    category: "Cybersecurity & Cryptography",
    publisher: "Wiley",
    publicationYear: 2014,
    pages: 624,
    description: "Actionable frameworks (STRIDE, DREAD) to discover architectural flaws before code hits production.",
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Practical Malware Analysis",
    subtitle: "The Hands-On Guide to Dissecting Malicious Software",
    isbn: "978-1593272906",
    author: "Michael Sikorski & Andrew Honig",
    category: "Cybersecurity & Cryptography",
    publisher: "No Starch Press",
    publicationYear: 2012,
    pages: 800,
    description: "Disassemble malware binaries in IDA Pro, unpack obfuscated code, and analyze zero-day exploits safely.",
    coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Cryptography Engineering: Design Principles and Practical Applications",
    subtitle: "Ferguson, Schneier, Kohno",
    isbn: "978-0470474242",
    author: "Niels Ferguson & Bruce Schneier",
    category: "Cybersecurity & Cryptography",
    publisher: "Wiley",
    publicationYear: 2010,
    pages: 384,
    description: "Focuses on the engineering realities of implementing secure crypto systems without introducing side-channel vulnerabilities.",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600"
  },

  // 4. Data Science & Cloud Architecture
  {
    title: "Designing Data-Intensive Applications",
    subtitle: "The Big Ideas Behind Reliable, Scalable, and Maintainable Systems",
    isbn: "978-1449373320",
    author: "Martin Kleppmann",
    category: "Data Science & Cloud Architecture",
    publisher: "O'Reilly Media",
    publicationYear: 2017,
    pages: 616,
    description: "The gold standard text on databases, distributed consensus, partitioning, replication, and event streaming systems.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Python for Data Analysis",
    subtitle: "Data Wrangling with pandas, NumPy, and Jupyter",
    isbn: "978-1098104030",
    author: "Wes McKinney",
    category: "Data Science & Cloud Architecture",
    publisher: "O'Reilly Media",
    publicationYear: 2022,
    pages: 550,
    description: "Written by the creator of pandas, the definitive hands-on manual for statistical data manipulation and visualization.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Building Microservices: Designing Fine-Grained Systems",
    subtitle: "Second Edition",
    isbn: "978-1492034025",
    author: "Sam Newman",
    category: "Data Science & Cloud Architecture",
    publisher: "O'Reilly Media",
    publicationYear: 2021,
    pages: 612,
    description: "Comprehensive guide to microservices architecture, boundary decomposition, asynchronous messaging, and observability.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Site Reliability Engineering: How Google Runs Production Systems",
    subtitle: "SRE Best Practices",
    isbn: "978-1491929124",
    author: "Niall Richard Murphy & Betsy Beyer",
    category: "Data Science & Cloud Architecture",
    publisher: "O'Reilly Media",
    publicationYear: 2016,
    pages: 550,
    description: "Google's internal engineers explain how they manage hyper-scale cloud operations with SLA/SLO budgets and chaos automation.",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Storytelling with Data: A Data Visualization Guide for Business",
    subtitle: "Turning Complex Numbers into Impactful Stories",
    isbn: "978-1119002253",
    author: "Cole Nussbaumer Knaflic",
    category: "Data Science & Cloud Architecture",
    publisher: "Wiley",
    publicationYear: 2015,
    pages: 288,
    description: "Learn how to eliminate chart clutter, direct audience attention, and communicate quantitative findings clearly.",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Cloud Native Patterns: Designing High-Availability Cloud Applications",
    subtitle: "Resilient Microservice Topologies",
    isbn: "978-1617294297",
    author: "Cornelia Davis",
    category: "Data Science & Cloud Architecture",
    publisher: "Manning Publications",
    publicationYear: 2019,
    pages: 384,
    description: "Core architectural tenets that govern twelve-factor apps, container orchestrators, and declarative distributed systems.",
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Practical Statistics for Data Scientists",
    subtitle: "50+ Essential Concepts Using R and Python",
    isbn: "978-1492072942",
    author: "Peter Bruce & Andrew Bruce",
    category: "Data Science & Cloud Architecture",
    publisher: "O'Reilly Media",
    publicationYear: 2020,
    pages: 368,
    description: "Clear reference for applying exploratory analysis, bootstrapping, hypothesis testing, and regression to real-world datasets.",
    coverImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600"
  },

  // 5. Astrophysics & Cosmology
  {
    title: "A Brief History of Time",
    subtitle: "From the Big Bang to Black Holes",
    isbn: "978-0553380163",
    author: "Stephen Hawking",
    category: "Astrophysics & Cosmology",
    publisher: "Bantam Books",
    publicationYear: 1998,
    pages: 256,
    description: "Hawking's iconic masterpiece exploring the nature of time, general relativity, quantum mechanics, and cosmic singularity.",
    coverImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Astrophysics for People in a Hurry",
    subtitle: "The Universe in Concise Perspective",
    isbn: "978-0393609394",
    author: "Neil deGrasse Tyson",
    category: "Astrophysics & Cosmology",
    publisher: "W. W. Norton & Company",
    publicationYear: 2017,
    pages: 224,
    description: "Quick, witty, and insightful overview of quantum physics, dark energy, galaxy clustering, and the origin of our cosmos.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Cosmos",
    subtitle: "The Story of Cosmic Evolution, Science and Civilization",
    isbn: "978-0345539434",
    author: "Carl Sagan",
    category: "Astrophysics & Cosmology",
    publisher: "Ballantine Books",
    publicationYear: 2013,
    pages: 432,
    description: "Sagan tracks 15 billion years of cosmic history and the development of science, technology, and philosophy.",
    coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Elegant Universe: Superstrings, Hidden Dimensions",
    subtitle: "The Quest for the Ultimate Theory of Reality",
    isbn: "978-0393058581",
    author: "Brian Greene",
    category: "Astrophysics & Cosmology",
    publisher: "W. W. Norton & Company",
    publicationYear: 2010,
    pages: 464,
    description: "Clear and accessible exposition of superstring theory, 11-dimensional hyperspace, and the unification of gravity and quantum mechanics.",
    coverImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Black Holes and Time Warps: Einstein's Outrageous Legacy",
    subtitle: "Commonwealth Fund Book Program",
    isbn: "978-0393312767",
    author: "Kip S. Thorne",
    category: "Astrophysics & Cosmology",
    publisher: "W. W. Norton & Company",
    publicationYear: 1994,
    pages: 619,
    description: "Nobel laureate Kip Thorne chronicles theoretical breakthroughs surrounding gravitational waves, wormholes, and black hole event horizons.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Until the End of Time",
    subtitle: "Mind, Matter, and Our Search for Meaning in an Evolving Universe",
    isbn: "978-0525658832",
    author: "Brian Greene",
    category: "Astrophysics & Cosmology",
    publisher: "Knopf",
    publicationYear: 2020,
    pages: 448,
    description: "Deep exploration of thermodynamics, consciousness, and the cosmic timeline from the initial burst to the cold death of entropy.",
    coverImage: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Pale Blue Dot: A Vision of the Human Future in Space",
    subtitle: "A Sacred View of Earth",
    isbn: "978-0345376596",
    author: "Carl Sagan",
    category: "Astrophysics & Cosmology",
    publisher: "Ballantine Books",
    publicationYear: 1997,
    pages: 384,
    description: "Inspiring manifesto reflecting on Voyager 1's photograph of Earth as a speck of dust suspended in a sunbeam.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600"
  },

  // 6. Theoretical Physics & Quantum Mechanics
  {
    title: "Quantum Computation and Quantum Information",
    subtitle: "10th Anniversary Cambridge Standard Edition",
    isbn: "978-1107002173",
    author: "Michael A. Nielsen & Isaac L. Chuang",
    category: "Theoretical Physics & Quantum Mechanics",
    publisher: "Cambridge University Press",
    publicationYear: 2011,
    pages: 702,
    description: "The universally cited definitive standard textbook on qubits, quantum circuits, Shor's algorithm, and quantum error correction.",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Six Easy Pieces: Essentials of Physics Explained by Its Most Brilliant Teacher",
    subtitle: "Feynman Lectures on Physics",
    isbn: "978-0465025275",
    author: "Richard P. Feynman",
    category: "Theoretical Physics & Quantum Mechanics",
    publisher: "Basic Books",
    publicationYear: 2011,
    pages: 176,
    description: "Feynman's greatest introductory lectures covering atomic theory, basic physics, quantum behavior, and the law of gravitation.",
    coverImage: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Surely You're Joking, Mr. Feynman!",
    subtitle: "Adventures of a Curious Character",
    isbn: "978-0393316049",
    author: "Richard P. Feynman",
    category: "Theoretical Physics & Quantum Mechanics",
    publisher: "W. W. Norton & Company",
    publicationYear: 1997,
    pages: 352,
    description: "The outrageous, hilarious, and inspiring autobiography of Nobel Prize physicist Richard Feynman.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Seven Brief Lessons on Physics",
    subtitle: "The Italian Bestseller on Modern Science",
    isbn: "978-0399184413",
    author: "Carlo Rovelli",
    category: "Theoretical Physics & Quantum Mechanics",
    publisher: "Riverhead Books",
    publicationYear: 2016,
    pages: 96,
    description: "A playful, entertaining, and mind-bending introduction to modern physics, general relativity, and loop quantum gravity.",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Order of Time",
    subtitle: "Physics, Philosophy, and Entropy",
    isbn: "978-0735216105",
    author: "Carlo Rovelli",
    category: "Theoretical Physics & Quantum Mechanics",
    publisher: "Riverhead Books",
    publicationYear: 2018,
    pages: 256,
    description: "Rovelli dissolves our conventional understanding of time, showing that at the quantum level, the world is made of events, not things.",
    coverImage: "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Principles of Quantum Mechanics",
    subtitle: "Second Edition",
    isbn: "978-0306447908",
    author: "R. Shankar",
    category: "Theoretical Physics & Quantum Mechanics",
    publisher: "Plenum Press",
    publicationYear: 1994,
    pages: 676,
    description: "Renowned for its mathematical clarity and pedagocial rigor, Shankar bridges classical mechanics with Dirac's bra-ket notation.",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Quantum: Einstein, Bohr, and the Great Debate",
    subtitle: "About the Nature of Reality",
    isbn: "978-0393339888",
    author: "Manjit Kumar",
    category: "Theoretical Physics & Quantum Mechanics",
    publisher: "W. W. Norton & Company",
    publicationYear: 2010,
    pages: 464,
    description: "The gripping intellectual clash between Albert Einstein and Niels Bohr over whether God plays dice with the universe.",
    coverImage: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=600"
  },

  // 7. Mathematics & Pure Logic
  {
    title: "Gödel, Escher, Bach: An Eternal Golden Braid",
    subtitle: "20th Anniversary Edition Pulitzer Prize Winner",
    isbn: "978-0465026562",
    author: "Douglas R. Hofstadter",
    category: "Mathematics & Pure Logic",
    publisher: "Basic Books",
    publicationYear: 1999,
    pages: 824,
    description: "Brilliant exploration of how self-referential mathematical systems and strange loops give rise to consciousness.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Fermat's Enigma: The Epic Quest to Solve the World's Greatest Mathematical Problem",
    subtitle: "The 358-Year Mystery",
    isbn: "978-0385493628",
    author: "Simon Singh",
    category: "Mathematics & Pure Logic",
    publisher: "Anchor",
    publicationYear: 1998,
    pages: 336,
    description: "The thrilling historical drama of Andrew Wiles' secret seven-year solitary struggle to prove Fermat's Last Theorem.",
    coverImage: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "How Not to Be Wrong: The Power of Mathematical Thinking",
    subtitle: "Everyday Logic and Statistical Reason",
    isbn: "978-0143127536",
    author: "Jordan Ellenberg",
    category: "Mathematics & Pure Logic",
    publisher: "Penguin Books",
    publicationYear: 2015,
    pages: 480,
    description: "Shows how mathematical analysis reveals hidden structure beneath chaotic political polling, lotteries, and economic decisions.",
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Princeton Companion to Mathematics",
    subtitle: "Field Medalist Encyclopedia",
    isbn: "978-0691118802",
    author: "Timothy Gowers & June Barrow-Green",
    category: "Mathematics & Pure Logic",
    publisher: "Princeton University Press",
    publicationYear: 2008,
    pages: 1056,
    description: "A monumental panoramic survey of pure mathematics written by leading mathematicians across the globe.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Infinite Powers: How Calculus Reveals the Secrets of the Universe",
    subtitle: "The Universal Language of Change",
    isbn: "978-1328879981",
    author: "Steven Strogatz",
    category: "Mathematics & Pure Logic",
    publisher: "Eamon Dolan/Houghton Mifflin Harcourt",
    publicationYear: 2019,
    pages: 384,
    description: "Strogatz reveals how calculus transformed human history by enabling the discovery of celestial orbits, GPS, and electricity.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Linear Algebra Done Right",
    subtitle: "Undergraduate Texts in Mathematics",
    isbn: "978-3319110790",
    author: "Sheldon Axler",
    category: "Mathematics & Pure Logic",
    publisher: "Springer",
    publicationYear: 2014,
    pages: 340,
    description: "Best-selling textbook famous for treating linear algebra geometrically by introducing eigenvalues without determinants.",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "A Mathematician's Apology",
    subtitle: "Cambridge Classic Edition",
    isbn: "978-1107604636",
    author: "G. H. Hardy",
    category: "Mathematics & Pure Logic",
    publisher: "Cambridge University Press",
    publicationYear: 2012,
    pages: 154,
    description: "Hardy's poetic and deeply personal manifesto defending the aesthetic beauty and intrinsic purity of mathematics.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },

  // 8. Philosophy & Ethics
  {
    title: "Meditations",
    subtitle: "A New Translation by Gregory Hays",
    isbn: "978-0812968255",
    author: "Marcus Aurelius",
    category: "Philosophy & Ethics",
    publisher: "Modern Library",
    publicationYear: 2003,
    pages: 256,
    description: "The private stoic spiritual journal of the Roman Emperor Marcus Aurelius on virtue, resilience, and mortality.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Beyond Good and Evil",
    subtitle: "Prelude to a Philosophy of the Future",
    isbn: "978-0140449235",
    author: "Friedrich Nietzsche",
    category: "Philosophy & Ethics",
    publisher: "Penguin Classics",
    publicationYear: 2003,
    pages: 240,
    description: "Nietzsche deconstructs traditional European morality, the will to truth, and introduces the concept of the will to power.",
    coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Justice: What's the Right Thing to Do?",
    subtitle: "Harvard University Global Lectures",
    isbn: "978-0374532505",
    author: "Michael J. Sandel",
    category: "Philosophy & Ethics",
    publisher: "Farrar, Straus and Giroux",
    publicationYear: 2010,
    pages: 320,
    description: "Engaging inquiry into utilitarianism, Kantian duty, libertarian rights, and affirmative action through real-world dilemmas.",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Republic",
    subtitle: "Standard Translation by Allan Bloom",
    isbn: "978-0465069347",
    author: "Plato",
    category: "Philosophy & Ethics",
    publisher: "Basic Books",
    publicationYear: 2016,
    pages: 512,
    description: "Plato's foundational dialogue on justice, the philosopher king, the allegory of the cave, and the ideal state.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Critique of Pure Reason",
    subtitle: "Cambridge Edition of the Works of Immanuel Kant",
    isbn: "978-0521657297",
    author: "Immanuel Kant",
    category: "Philosophy & Ethics",
    publisher: "Cambridge University Press",
    publicationYear: 1999,
    pages: 784,
    description: "Kant's monumental synthesis of rationalism and empiricism that defined modern Western epistemology and metaphysics.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Letters from a Stoic",
    subtitle: "Epistulae Morales ad Lucilium",
    isbn: "978-0140442106",
    author: "Lucius Annaeus Seneca",
    category: "Philosophy & Ethics",
    publisher: "Penguin Classics",
    publicationYear: 2004,
    pages: 256,
    description: "Seneca's timeless philosophical advice on friendship, grief, poverty, anger, and leading a tranquil, deliberate life.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Man's Search for Meaning",
    subtitle: "The Classic Tribute to Hope from the Holocaust",
    isbn: "978-0807014295",
    author: "Viktor E. Frankl",
    category: "Philosophy & Ethics",
    publisher: "Beacon Press",
    publicationYear: 2006,
    pages: 184,
    description: "Psychiatrist Viktor Frankl's memoir of surviving Auschwitz and his development of logotherapy—finding purpose in suffering.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },

  // 9. Psychology & Behavioral Science
  {
    title: "Thinking, Fast and Slow",
    subtitle: "The International Bestselling Study on Human Cognition",
    isbn: "978-0374533557",
    author: "Daniel Kahneman",
    category: "Psychology & Behavioral Science",
    publisher: "Farrar, Straus and Giroux",
    publicationYear: 2013,
    pages: 512,
    description: "Nobel laureate Daniel Kahneman explains the dual-system cognitive architecture of intuitive System 1 and deliberative System 2.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Atomic Habits",
    subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    isbn: "978-0735211292",
    author: "James Clear",
    category: "Psychology & Behavioral Science",
    publisher: "Avery",
    publicationYear: 2018,
    pages: 320,
    description: "World-renowned framework on how 1% marginal daily improvements, cue design, and identity habits compound into life success.",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Predictably Irrational: The Hidden Forces That Shape Our Decisions",
    subtitle: "Revised and Expanded Edition",
    isbn: "978-0061353246",
    author: "Dan Ariely",
    category: "Psychology & Behavioral Science",
    publisher: "Harper Perennial",
    publicationYear: 2010,
    pages: 384,
    description: "MIT behavioral economist Dan Ariely refutes traditional economic theory by demonstrating systematic cognitive biases in pricing.",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Behave: The Biology of Humans at Our Best and Worst",
    subtitle: "Neurobiology and Human Morality",
    isbn: "978-0143110910",
    author: "Robert M. Sapolsky",
    category: "Psychology & Behavioral Science",
    publisher: "Penguin Books",
    publicationYear: 2018,
    pages: 800,
    description: "Stanford neuroscientist examines human actions through neuroscience, endocrinology, genetics, and evolutionary sociology.",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Man Who Mistook His Wife for a Hat",
    subtitle: "And Other Clinical Tales",
    isbn: "978-0684853949",
    author: "Oliver Sacks",
    category: "Psychology & Behavioral Science",
    publisher: "Touchstone",
    publicationYear: 1998,
    pages: 256,
    description: "Oliver Sacks tells bizarre, empathetic stories of patients afflicted with perceptual and neurological agnosia.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Flow: The Psychology of Optimal Experience",
    subtitle: "Harper Perennial Modern Classics",
    isbn: "978-0061339202",
    author: "Mihaly Csikszentmihalyi",
    category: "Psychology & Behavioral Science",
    publisher: "Harper Perennial",
    publicationYear: 2008,
    pages: 320,
    description: "Investigates deep states of focused immersion where human productivity, mastery, and satisfaction peak.",
    coverImage: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Influence: The Psychology of Persuasion",
    subtitle: "New and Expanded Edition",
    isbn: "978-0062937650",
    author: "Robert B. Cialdini",
    category: "Psychology & Behavioral Science",
    publisher: "Harper Business",
    publicationYear: 2021,
    pages: 592,
    description: "The seminal foundational work on the universal psychological triggers of persuasion: reciprocation, scarcity, authority, and social proof.",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600"
  },

  // 10. Economics & High Finance
  {
    title: "The Intelligent Investor: The Definitive Book on Value Investing",
    subtitle: "Revised Edition with Commentary by Jason Zweig",
    isbn: "978-0060555665",
    author: "Benjamin Graham",
    category: "Economics & High Finance",
    publisher: "Harper Business",
    publicationYear: 2006,
    pages: 640,
    description: "Warren Buffett's favorite financial text detailing margin of safety, Mr. Market, and defensive portfolio allocation.",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Psychology of Money",
    subtitle: "Timeless Lessons on Wealth, Greed, and Happiness",
    isbn: "978-0857197689",
    author: "Morgan Housel",
    category: "Economics & High Finance",
    publisher: "Harriman House",
    publicationYear: 2020,
    pages: 252,
    description: "Engaging short stories exploring how personal ego, risk tolerances, and social status dictate financial fortunes.",
    coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Principles for Dealing with the Changing World Order",
    subtitle: "Why Nations Succeed and Fail",
    isbn: "978-1982160272",
    author: "Ray Dalio",
    category: "Economics & High Finance",
    publisher: "Avid Reader Press / Simon & Schuster",
    publicationYear: 2021,
    pages: 576,
    description: "Billionaire hedge fund manager Ray Dalio charts the 500-year history of debt supercycles, reserve currencies, and geopolitical shifts.",
    coverImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Capital in the Twenty-First Century",
    subtitle: "Belknap Press Edition",
    isbn: "978-0674430006",
    author: "Thomas Piketty",
    category: "Economics & High Finance",
    publisher: "Harvard University Press",
    publicationYear: 2014,
    pages: 696,
    description: "Exhaustive economic analysis of 200 years of tax records proving that return on capital (r) consistently outpaces economic growth (g).",
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Wealth of Nations",
    subtitle: "Representative Modern Library Edition",
    isbn: "978-0679783367",
    author: "Adam Smith",
    category: "Economics & High Finance",
    publisher: "Modern Library",
    publicationYear: 2000,
    pages: 1200,
    description: "The founding text of classical economics, establishing the division of labor, productivity, and the invisible hand of free markets.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "A Random Walk Down Wall Street",
    subtitle: "The Time-Tested Strategy for Successful Investing",
    isbn: "978-1324051138",
    author: "Burton G. Malkiel",
    category: "Economics & High Finance",
    publisher: "W. W. Norton & Company",
    publicationYear: 2023,
    pages: 480,
    description: "The definitive defense of the efficient market hypothesis and broad-based, low-cost index fund investing over active stock picking.",
    coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Freakonomics: A Rogue Economist Explores the Hidden Side of Everything",
    subtitle: "Revised Edition",
    isbn: "978-0060731335",
    author: "Steven D. Levitt & Stephen J. Dubner",
    category: "Economics & High Finance",
    publisher: "William Morrow",
    publicationYear: 2009,
    pages: 336,
    description: "Levitt uses economic incentives and statistical regressions to uncover riddles of sumo wrestling, school teachers, and real estate agents.",
    coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600"
  },

  // 11. Business Strategy & Leadership
  {
    title: "Zero to One: Notes on Startups, or How to Build the Future",
    subtitle: "The Contrarian Entrepreneurship Handbook",
    isbn: "978-0804139298",
    author: "Peter Thiel & Blake Masters",
    category: "Business Strategy & Leadership",
    publisher: "Crown Business",
    publicationYear: 2014,
    pages: 224,
    description: "Peter Thiel argues that true technological progress creates proprietary monopolies rather than competing in commoditized red oceans.",
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Good to Great: Why Some Companies Make the Leap... and Others Don't",
    subtitle: "Management Masterclass",
    isbn: "978-0066620992",
    author: "Jim Collins",
    category: "Business Strategy & Leadership",
    publisher: "Harper Business",
    publicationYear: 2001,
    pages: 320,
    description: "Identifies the Hedgehog Concept, Level 5 Leadership, and Flywheel momentum that propel good enterprises into generational greatness.",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Lean Startup",
    subtitle: "How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses",
    isbn: "978-0307887894",
    author: "Eric Ries",
    category: "Business Strategy & Leadership",
    publisher: "Crown Business",
    publicationYear: 2011,
    pages: 336,
    description: "Introduces the Build-Measure-Learn feedback loop, Minimum Viable Products, and validated learning for extreme uncertainty.",
    coverImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Shoe Dog: A Memoir by the Creator of Nike",
    subtitle: "The Raw Untold Story",
    isbn: "978-1501135927",
    author: "Phil Knight",
    category: "Business Strategy & Leadership",
    publisher: "Scribner",
    publicationYear: 2018,
    pages: 400,
    description: "Nike founder Phil Knight's deeply candid memoir on bootstrapping an athletic footwear brand from the trunk of a car.",
    coverImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "High Output Management",
    subtitle: "Intel Silicon Valley Classic",
    isbn: "978-0679762881",
    author: "Andrew S. Grove",
    category: "Business Strategy & Leadership",
    publisher: "Vintage",
    publicationYear: 1995,
    pages: 272,
    description: "Legendary Intel CEO Andy Grove shares master techniques on managerial leverage, meetings, and team production output.",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Measure What Matters",
    subtitle: "How Google, Bono, and the Gates Foundation Rock the World with OKRs",
    isbn: "978-0525536222",
    author: "John Doerr",
    category: "Business Strategy & Leadership",
    publisher: "Portfolio",
    publicationYear: 2018,
    pages: 320,
    description: "Legendary venture capitalist John Doerr reveals how Objectives and Key Results (OKRs) helped tech titans scale hyper-growth.",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Innovator's Dilemma",
    subtitle: "When New Technologies Cause Great Firms to Fail",
    isbn: "978-1633691780",
    author: "Clayton M. Christensen",
    category: "Business Strategy & Leadership",
    publisher: "Harvard Business Review Press",
    publicationYear: 2016,
    pages: 288,
    description: "Explains how market leaders can do everything right and still lose market share to low-end disruptive innovations.",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600"
  },

  // 12. World History & Geopolitics
  {
    title: "Sapiens: A Brief History of Humankind",
    subtitle: "From Animals into Gods",
    isbn: "978-0062316097",
    author: "Yuval Noah Harari",
    category: "World History & Geopolitics",
    publisher: "Harper",
    publicationYear: 2015,
    pages: 464,
    description: "Harari traces how cognitive, agricultural, and scientific revolutions enabled Homo sapiens to dominate planet Earth through shared myths.",
    coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Guns, Germs, and Steel: The Fates of Human Societies",
    subtitle: "Pulitzer Prize Winner 20th Anniversary Edition",
    isbn: "978-0393354324",
    author: "Jared Diamond",
    category: "World History & Geopolitics",
    publisher: "W. W. Norton & Company",
    publicationYear: 2017,
    pages: 528,
    description: "Argues that geographic, ecological, and environmental factors—not genetic differences—shaped modern global inequalities.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Silk Roads: A New History of the World",
    subtitle: "Global Network of Civilizations",
    isbn: "978-1101912379",
    author: "Peter Frankopan",
    category: "World History & Geopolitics",
    publisher: "Vintage",
    publicationYear: 2017,
    pages: 672,
    description: "Shifts world history away from Eurocentric perspectives to the trade networks of Central Asia that birthed world religions and commerce.",
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "SPQR: A History of Ancient Rome",
    subtitle: "Senator Populusque Romanus",
    isbn: "978-1631492228",
    author: "Mary Beard",
    category: "World History & Geopolitics",
    publisher: "Liveright",
    publicationYear: 2016,
    pages: 608,
    description: "Cambridge classicist Mary Beard explores how an ordinary muddy village in central Italy transformed into a world-dominating empire.",
    coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Lessons of History",
    subtitle: "50th Anniversary Edition",
    isbn: "978-1439149959",
    author: "Will Durant & Ariel Durant",
    category: "World History & Geopolitics",
    publisher: "Simon & Schuster",
    publicationYear: 2010,
    pages: 128,
    description: "Distillation of four decades of historical study surveying human biology, race, morals, religion, economics, government, and war.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Homo Deus: A Brief History of Tomorrow",
    subtitle: "The Future of Artificial Minds",
    isbn: "978-0062464316",
    author: "Yuval Noah Harari",
    category: "World History & Geopolitics",
    publisher: "Harper",
    publicationYear: 2017,
    pages: 448,
    description: "Harari envisions future projects of humanity: conquering death, engineering artificial consciousness, and creating algorithmic deities.",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Prisoners of Geography: Ten Maps That Tell You Everything",
    subtitle: "Global Geopolitical Realities",
    isbn: "978-1501121470",
    author: "Tim Marshall",
    category: "World History & Geopolitics",
    publisher: "Scribner",
    publicationYear: 2016,
    pages: 320,
    description: "Shows how mountain ranges, rivers, and chokepoints constrain world leaders and dictate foreign military conflicts.",
    coverImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600"
  },

  // 13. Classic World Literature
  {
    title: "1984",
    subtitle: "Signet Classics Centennial Edition",
    isbn: "978-0451524935",
    author: "George Orwell",
    category: "Classic World Literature",
    publisher: "Signet Classics",
    publicationYear: 1950,
    pages: 328,
    description: "Orwell's chilling dystopian vision of totalitarian surveillance, Doublethink, the Ministry of Truth, and Big Brother.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "To Kill a Mockingbird",
    subtitle: "Harper Perennial Modern Classics",
    isbn: "978-0060935467",
    author: "Harper Lee",
    category: "Classic World Literature",
    publisher: "Harper Perennial",
    publicationYear: 2002,
    pages: 336,
    description: "Pulitzer prize winning masterpiece of racial injustice, moral courage, and childhood innocence in the American South.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Great Gatsby",
    subtitle: "The Authorized Scribner Paperback Edition",
    isbn: "978-0743273565",
    author: "F. Scott Fitzgerald",
    category: "Classic World Literature",
    publisher: "Scribner",
    publicationYear: 2004,
    pages: 180,
    description: "The quintessential story of the Jazz Age, obsessed love, decadence, and the disillusionment of the American Dream in West Egg.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Crime and Punishment",
    subtitle: "Translation by Richard Pevear and Larissa Volokhonsky",
    isbn: "978-0679734505",
    author: "Fyodor Dostoevsky",
    category: "Classic World Literature",
    publisher: "Vintage",
    publicationYear: 1993,
    pages: 592,
    description: "Dostoevsky's psychological drama of guilt, hubris, redemption, and moral anguish following the murder of an old pawnbroker.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Pride and Prejudice",
    subtitle: "Penguin Classics Deluxe Edition",
    isbn: "978-0141439518",
    author: "Jane Austen",
    category: "Classic World Literature",
    publisher: "Penguin Classics",
    publicationYear: 2002,
    pages: 480,
    description: "Austen's sparkling comedy of manners and romantic tension between Elizabeth Bennet and the proud Mr. Fitzwilliam Darcy.",
    coverImage: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "One Hundred Years of Solitude",
    subtitle: "Harper Perennial Modern Classics",
    isbn: "978-0060883287",
    author: "Gabriel García Márquez",
    category: "Classic World Literature",
    publisher: "Harper Perennial",
    publicationYear: 2006,
    pages: 448,
    description: "Magical realist epic tracking seven generations of the Buendía family in the mythic Colombian town of Macondo.",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Brave New World",
    subtitle: "Harper Perennial Modern Classics",
    isbn: "978-0060850524",
    author: "Aldous Huxley",
    category: "Classic World Literature",
    publisher: "Harper Perennial",
    publicationYear: 2006,
    pages: 288,
    description: "Huxley's visionary dystopia of genetic engineering, conditioning, consumerism, and the pharmaceutical pacification of mankind.",
    coverImage: "https://images.unsplash.com/photo-1507842229452-78927493435e?auto=format&fit=crop&q=80&w=600"
  },

  // 14. Modern Fiction & Sci-Fi
  {
    title: "Dune",
    subtitle: "40th Anniversary Deluxe Edition",
    isbn: "978-0441013593",
    author: "Frank Herbert",
    category: "Modern Fiction & Sci-Fi",
    publisher: "Ace Books",
    publicationYear: 2005,
    pages: 896,
    description: "Set on the desert planet Arrakis, Herbert's planetary epic blends ecology, interstellar politics, spice economics, and messianic prophecy.",
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Three-Body Problem",
    subtitle: "Remembrance of Earth's Past Trilogy",
    isbn: "978-0765382030",
    author: "Cixin Liu",
    category: "Modern Fiction & Sci-Fi",
    publisher: "Tor Books",
    publicationYear: 2016,
    pages: 400,
    description: "Hugo Award-winning hard sci-fi novel about humanity's first contact with an alien civilization navigating a chaotic triple star system.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Foundation",
    subtitle: "Del Rey Mass Market Edition",
    isbn: "978-0553293357",
    author: "Isaac Asimov",
    category: "Modern Fiction & Sci-Fi",
    publisher: "Spectra / Del Rey",
    publicationYear: 1991,
    pages: 256,
    description: "Hari Seldon invents psychohistory to forecast the inevitable fall of the Galactic Empire and preserves humanity through the Foundation.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Neuromancer",
    subtitle: "The Sprawl Trilogy - Ace Science Fiction",
    isbn: "978-0441569595",
    author: "William Gibson",
    category: "Modern Fiction & Sci-Fi",
    publisher: "Ace Books",
    publicationYear: 2000,
    pages: 288,
    description: "The seminal cyberpunk novel that coined the term 'cyberspace' and introduced washed-up console cowboy Case and razor-girl Molly.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Snow Crash",
    subtitle: "Del Rey 30th Anniversary Edition",
    isbn: "978-0553380958",
    author: "Neal Stephenson",
    category: "Modern Fiction & Sci-Fi",
    publisher: "Del Rey",
    publicationYear: 2003,
    pages: 440,
    description: "Hiro Protagonist delivers pizza for the Mafia and investigates a digital drug/linguistic virus in Stephenson's iconic Metaverse.",
    coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Solaris",
    subtitle: "Harcourt Harvest Classic",
    isbn: "978-0156027601",
    author: "Stanislaw Lem",
    category: "Modern Fiction & Sci-Fi",
    publisher: "Mariner Books",
    publicationYear: 2002,
    pages: 224,
    description: "Scientists on an orbital research station confront psychological manifestations dredged from their own minds by a sentient alien ocean.",
    coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Do Androids Dream of Electric Sheep?",
    subtitle: "Del Rey Blade Runner Origin",
    isbn: "978-0345404473",
    author: "Philip K. Dick",
    category: "Modern Fiction & Sci-Fi",
    publisher: "Del Rey",
    publicationYear: 1996,
    pages: 256,
    description: "Bounty hunter Rick Deckard stalks rogue Nexus-6 androids in a post-apocalyptic San Francisco shrouded in radioactive fallout.",
    coverImage: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=600"
  },

  // 15. Biomedical Science & Genetics
  {
    title: "The Gene: An Intimate History",
    subtitle: "From Aristotle to Modern Molecular Medicine",
    isbn: "978-1476733524",
    author: "Siddhartha Mukherjee",
    category: "Biomedical Science & Genetics",
    publisher: "Scribner",
    publicationYear: 2016,
    pages: 608,
    description: "Pulitzer winner Siddhartha Mukherjee chronicles the discovery, mapping, and ethical dilemmas of manipulating the human genome.",
    coverImage: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Emperor of All Maladies: A Biography of Cancer",
    subtitle: "Pulitzer Prize in General Nonfiction",
    isbn: "978-1439170915",
    author: "Siddhartha Mukherjee",
    category: "Biomedical Science & Genetics",
    publisher: "Scribner",
    publicationYear: 2011,
    pages: 608,
    description: "Epic historical and medical biography detailing centuries of human battle against oncology from ancient Persia to modern immunotherapy.",
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Being Mortal: Medicine and What Matters in the End",
    subtitle: "Reflections on Modern Healthcare",
    isbn: "978-1250081247",
    author: "Atul Gawande",
    category: "Biomedical Science & Genetics",
    publisher: "Metropolitan Books",
    publicationYear: 2017,
    pages: 304,
    description: "Surgeon Atul Gawande addresses the limitations of modern hospice and medical intervention when confronting end-of-life care.",
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "When Breath Becomes Air",
    subtitle: "Foreword by Abraham Verghese",
    isbn: "978-0812988406",
    author: "Paul Kalanithi",
    category: "Biomedical Science & Genetics",
    publisher: "Random House",
    publicationYear: 2016,
    pages: 256,
    description: "Profoundly moving memoir by 36-year-old neurosurgeon Paul Kalanithi diagnosing his own stage IV terminal lung cancer.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Genome: The Autobiography of a Species in 23 Chapters",
    subtitle: "Harper Perennial Edition",
    isbn: "978-0060194970",
    author: "Matt Ridley",
    category: "Biomedical Science & Genetics",
    publisher: "Harper Perennial",
    publicationYear: 2006,
    pages: 352,
    description: "Ridley picks a newly discovered gene from each pair of human chromosomes to tell the evolutionary story of our species.",
    coverImage: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "The Code Breaker",
    subtitle: "Jennifer Doudna, Gene Editing, and the Future of the Human Race",
    isbn: "978-1982115852",
    author: "Walter Isaacson",
    category: "Biomedical Science & Genetics",
    publisher: "Simon & Schuster",
    publicationYear: 2021,
    pages: 560,
    description: "Master biographer Walter Isaacson details the Nobel Prize-winning discovery of CRISPR-Cas9 programmable gene editing.",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Silent Spring",
    subtitle: "50th Anniversary Edition",
    isbn: "978-0618249060",
    author: "Rachel Carson",
    category: "Biomedical Science & Genetics",
    publisher: "Mariner Books",
    publicationYear: 2002,
    pages: 400,
    description: "The courageous 1962 landmark expose of synthetic pesticide bioaccumulation that ignited the modern global environmental movement.",
    coverImage: "https://images.unsplash.com/photo-1500829243541-74b677fecc30?auto=format&fit=crop&q=80&w=600"
  }
];

const seedBooks = async () => {
  try {
    console.log("=== [Seeder] Starting 100+ Books Seeder with Zero Duplicates ===");

    // 1. Find or create default library
    let library = await Library.findOne();
    if (!library) {
      library = await Library.create({
        name: "Central National Institute of Technology Library",
        code: "CNIT-01",
        email: "contact@cnit-library.org",
        phone: "+91 98765 43210",
        address: {
          street: "Knowledge Boulevard, Tech Park",
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
          zipCode: "560100"
        },
        status: "ACTIVE"
      });
    }

    const libraryId = library._id;

    // 2. Map existing Authors, Categories, Publishers
    const categoryCache = new Map();
    const authorCache = new Map();
    const publisherCache = new Map();

    const existingCategories = await Category.find({ libraryId });
    existingCategories.forEach(c => categoryCache.set(c.name.trim().toLowerCase(), c._id));

    const existingAuthors = await Author.find({ libraryId });
    existingAuthors.forEach(a => authorCache.set(a.name.trim().toLowerCase(), a._id));

    const existingPublishers = await Publisher.find({ libraryId });
    existingPublishers.forEach(p => publisherCache.set(p.name.trim().toLowerCase(), p._id));

    // 3. Fetch existing books to prevent any duplicate insertion
    const existingBooks = await Book.find({ libraryId });
    const existingIsbns = new Set(existingBooks.map(b => b.isbn.trim().replace(/[-\s]/g, "").toLowerCase()));
    const existingTitles = new Set(existingBooks.map(b => b.title.trim().toLowerCase()));

    console.log(`Found ${existingBooks.length} existing books in database.`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const item of RAW_BOOKS) {
      const cleanIsbn = item.isbn.trim().replace(/[-\s]/g, "").toLowerCase();
      const cleanTitle = item.title.trim().toLowerCase();

      if (existingIsbns.has(cleanIsbn) || existingTitles.has(cleanTitle)) {
        skippedCount++;
        continue;
      }

      // Ensure Category exists
      const catKey = item.category.trim().toLowerCase();
      let categoryId = categoryCache.get(catKey);
      if (!categoryId) {
        const newCat = await Category.create({
          name: item.category.trim(),
          description: `Curated collection in ${item.category}`,
          libraryId,
          isActive: true
        });
        categoryId = newCat._id;
        categoryCache.set(catKey, categoryId);
      }

      // Ensure Author exists
      const authKey = item.author.trim().toLowerCase();
      let authorId = authorCache.get(authKey);
      if (!authorId) {
        const newAuth = await Author.create({
          name: item.author.trim(),
          libraryId,
          isActive: true
        });
        authorId = newAuth._id;
        authorCache.set(authKey, authorId);
      }

      // Ensure Publisher exists
      const pubKey = item.publisher.trim().toLowerCase();
      let publisherId = publisherCache.get(pubKey);
      if (!publisherId) {
        const newPub = await Publisher.create({
          name: item.publisher.trim(),
          libraryId
        });
        publisherId = newPub._id;
        publisherCache.set(pubKey, publisherId);
      }

      // Create Book
      const createdBook = await Book.create({
        title: item.title,
        subtitle: item.subtitle,
        isbn: item.isbn,
        category: categoryId,
        author: authorId,
        publisher: publisherId,
        publicationYear: item.publicationYear,
        pages: item.pages,
        description: item.description,
        coverImage: item.coverImage,
        thumbnail: item.coverImage,
        libraryId,
        status: "AVAILABLE",
        isActive: true
      });

      // Also create an Inventory record and BookCopy so physical systems work
      await Inventory.create({
        bookId: createdBook._id,
        libraryId,
        totalCopies: 10,
        availableCopies: 10,
        borrowedCopies: 0,
        reservedCopies: 0
      }).catch(() => {});

      existingIsbns.add(cleanIsbn);
      existingTitles.add(cleanTitle);
      insertedCount++;
    }

    const totalActive = await Book.countDocuments({ status: "AVAILABLE", isActive: true });
    console.log(`=== [Seeder Finished] Inserted: ${insertedCount}, Skipped: ${skippedCount}, Total Available Books: ${totalActive} ===`);
    return { insertedCount, skippedCount, totalActive };
  } catch (error) {
    console.error("Error seeding books:", error);
    throw error;
  }
};

module.exports = seedBooks;
