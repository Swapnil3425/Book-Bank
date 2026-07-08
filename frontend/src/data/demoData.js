// frontend/src/data/demoData.js
// All mock data and API response handler for demo mode
// Dates are computed dynamically relative to today so they always look fresh.

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const daysLater = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

// ─── Demo Users ──────────────────────────────────────────────────────────────
export const DEMO_STUDENT = {
  _id: "demo-student-001",
  name: "Arjun Sharma",
  email: "demo.student@iiitp.ac.in",
  role: "student",
  institutionalId: "IIITP2024CS042",
  course: "B.Tech CSE",
  phone: "9876543210",
  isVerified: true,
  verificationStatus: "approved",
  isDemo: true,
};

export const DEMO_ADMIN = {
  _id: "demo-admin-001",
  name: "Dr. Priya Nair",
  email: "demo.admin@iiitp.ac.in",
  role: "admin",
  isDemo: true,
};

// ─── Demo Books ──────────────────────────────────────────────────────────────
const DEMO_BOOKS = [
  { _id: "db-001", title: "Introduction to Algorithms", author: "Thomas H. Cormen", course: "CS201", genre: "Algorithms", totalCopies: 8, availableCopies: 3 },
  { _id: "db-002", title: "Operating System Concepts", author: "Abraham Silberschatz", course: "CS301", genre: "Systems", totalCopies: 6, availableCopies: 2 },
  { _id: "db-003", title: "Database System Concepts", author: "Silberschatz, Korth & Sudarshan", course: "CS302", genre: "Databases", totalCopies: 5, availableCopies: 5 },
  { _id: "db-004", title: "Computer Networks", author: "Andrew S. Tanenbaum", course: "CS401", genre: "Networks", totalCopies: 4, availableCopies: 1 },
  { _id: "db-005", title: "Discrete Mathematics and Its Applications", author: "Kenneth H. Rosen", course: "MA101", genre: "Mathematics", totalCopies: 10, availableCopies: 7 },
  { _id: "db-006", title: "Digital Design", author: "Morris Mano", course: "EC201", genre: "Electronics", totalCopies: 6, availableCopies: 4 },
  { _id: "db-007", title: "The Art of Computer Programming Vol.1", author: "Donald E. Knuth", course: "CS501", genre: "Algorithms", totalCopies: 3, availableCopies: 0 },
  { _id: "db-008", title: "Computer Organization and Architecture", author: "William Stallings", course: "CS202", genre: "Architecture", totalCopies: 7, availableCopies: 5 },
  { _id: "db-009", title: "Compilers: Principles, Techniques & Tools", author: "Alfred V. Aho", course: "CS402", genre: "Compilers", totalCopies: 4, availableCopies: 3 },
  { _id: "db-010", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig", course: "CS501", genre: "AI/ML", totalCopies: 5, availableCopies: 2 },
  { _id: "db-011", title: "Software Engineering", author: "Ian Sommerville", course: "CS303", genre: "Software Eng.", totalCopies: 8, availableCopies: 6 },
  { _id: "db-012", title: "Linear Algebra and Its Applications", author: "Gilbert Strang", course: "MA201", genre: "Mathematics", totalCopies: 6, availableCopies: 4 },
  { _id: "db-013", title: "Data Communications and Networking", author: "Behrouz A. Forouzan", course: "CS401", genre: "Networks", totalCopies: 5, availableCopies: 3 },
  { _id: "db-014", title: "Object-Oriented Programming with Java", author: "Herbert Schildt", course: "CS102", genre: "Programming", totalCopies: 9, availableCopies: 6 },
  { _id: "db-015", title: "Design Patterns: Elements of Reusable OO Software", author: "Gang of Four", course: "CS303", genre: "Software Eng.", totalCopies: 3, availableCopies: 1 },
  { _id: "db-016", title: "Clean Code", author: "Robert C. Martin", course: "CS303", genre: "Programming", totalCopies: 7, availableCopies: 4 },
  { _id: "db-017", title: "Introduction to the Theory of Computation", author: "Michael Sipser", course: "CS402", genre: "Algorithms", totalCopies: 5, availableCopies: 1 },
  { _id: "db-018", title: "Pattern Recognition and Machine Learning", author: "Christopher M. Bishop", course: "CS501", genre: "AI/ML", totalCopies: 4, availableCopies: 2 },
  { _id: "db-019", title: "Advanced Engineering Mathematics", author: "Erwin Kreyszig", course: "MA202", genre: "Mathematics", totalCopies: 12, availableCopies: 8 },
  { _id: "db-020", title: "Principles of Physics", author: "Halliday & Resnick", course: "PH101", genre: "Physics", totalCopies: 15, availableCopies: 5 },
  { _id: "db-021", title: "The C Programming Language", author: "Brian W. Kernighan", course: "CS101", genre: "Programming", totalCopies: 10, availableCopies: 2 },
  { _id: "db-022", title: "Structure and Interpretation of Computer Programs", author: "Harold Abelson", course: "CS102", genre: "Programming", totalCopies: 4, availableCopies: 3 },
  { _id: "db-023", title: "Deep Learning", author: "Ian Goodfellow", course: "CS502", genre: "AI/ML", totalCopies: 6, availableCopies: 0 },
  { _id: "db-024", title: "Distributed Systems: Concepts and Design", author: "George Coulouris", course: "CS403", genre: "Systems", totalCopies: 5, availableCopies: 2 },
  { _id: "db-025", title: "Computer Graphics: Principles and Practice", author: "John F. Hughes", course: "CS404", genre: "Graphics", totalCopies: 3, availableCopies: 3 },
];

// ─── Demo Borrows (for student view) ─────────────────────────────────────────
const DEMO_STUDENT_BORROWS = [
  {
    _id: "dborrow-001",
    book: { _id: "db-001", title: "Introduction to Algorithms", author: "Thomas H. Cormen" },
    student: DEMO_STUDENT,
    issueDate: daysAgo(20),
    dueDate: daysLater(10),
    status: "borrowed",
    returnDate: null,
    fineAmount: 0,
    finePaid: false,
  },
  {
    _id: "dborrow-002",
    book: { _id: "db-002", title: "Operating System Concepts", author: "Abraham Silberschatz" },
    student: DEMO_STUDENT,
    issueDate: daysAgo(35),
    dueDate: daysAgo(5),
    status: "overdue",
    returnDate: null,
    fineAmount: 25,
    finePaid: false,
  },
  {
    _id: "dborrow-003",
    book: { _id: "db-005", title: "Discrete Mathematics and Its Applications", author: "Kenneth H. Rosen" },
    student: DEMO_STUDENT,
    issueDate: daysAgo(50),
    dueDate: daysAgo(20),
    status: "returned",
    returnDate: daysAgo(22),
    fineAmount: 0,
    finePaid: false,
  },
  {
    _id: "dborrow-004",
    book: { _id: "db-003", title: "Database System Concepts", author: "Silberschatz, Korth & Sudarshan" },
    student: DEMO_STUDENT,
    issueDate: daysAgo(5),
    dueDate: daysLater(10),
    status: "borrowed",
    returnDate: null,
    fineAmount: 0,
    finePaid: false,
  },
  {
    _id: "dborrow-005",
    book: { _id: "db-006", title: "Digital Design", author: "Morris Mano" },
    student: DEMO_STUDENT,
    issueDate: daysAgo(65),
    dueDate: daysAgo(50),
    status: "returned",
    returnDate: daysAgo(48),
    fineAmount: 50,
    finePaid: true,
    finePaidAt: daysAgo(45),
  },
];

// ─── Demo Fines (for student fines page) ─────────────────────────────────────
const DEMO_FINES_RESPONSE = {
  totals: { totalFines: 75, pending: 25, paid: 50 },
  fines: [
    {
      _id: "dfine-001",
      book: { title: "Operating System Concepts" },
      issueDate: daysAgo(35),
      dueDate: daysAgo(5),
      fineAmount: 25,
      finePaid: false,
      finePaidAt: null,
    },
    {
      _id: "dfine-002",
      book: { title: "Digital Design" },
      issueDate: daysAgo(65),
      dueDate: daysAgo(50),
      fineAmount: 50,
      finePaid: true,
      finePaidAt: daysAgo(45),
    },
  ],
};

// ─── Demo Users (for admin panel) ────────────────────────────────────────────
const DEMO_USERS = [
  {
    _id: "du-001", name: "Arjun Sharma", email: "arjun.sharma@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024CS042",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id1.jpg",
  },
  {
    _id: "du-002", name: "Priya Patel", email: "priya.patel@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024CS017",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id2.jpg",
  },
  {
    _id: "du-003", name: "Rahul Mehta", email: "rahul.mehta@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024CS088",
    isVerified: false, verificationStatus: "pending",
    idPhotoPath: "https://example.com/id3.jpg",
  },
  {
    _id: "du-004", name: "Sneha Gupta", email: "sneha.gupta@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2023CS031",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id4.jpg",
  },
  {
    _id: "du-005", name: "Karan Singh", email: "karan.singh@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024EC005",
    isVerified: false, verificationStatus: "pending",
    idPhotoPath: "https://example.com/id5.jpg",
  },
  {
    _id: "du-006", name: "Ananya Roy", email: "ananya.roy@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2023CS055",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id6.jpg",
  },
  {
    _id: "du-007", name: "Vikram Joshi", email: "vikram.joshi@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024MA012",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id7.jpg",
  },
  {
    _id: "du-008", name: "Divya Nair", email: "divya.nair@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024CS099",
    isVerified: false, verificationStatus: "pending",
    idPhotoPath: "https://example.com/id8.jpg",
  },
  {
    _id: "du-009", name: "Rohan Kapoor", email: "rohan.kapoor@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2022CS011",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id9.jpg",
  },
  {
    _id: "du-010", name: "Neha Verma", email: "neha.verma@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024CS002",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id10.jpg",
  },
  {
    _id: "du-011", name: "Aditya Desai", email: "aditya.desai@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2023EC041",
    isVerified: false, verificationStatus: "pending",
    idPhotoPath: "https://example.com/id11.jpg",
  },
  {
    _id: "du-012", name: "Sanya Malhotra", email: "sanya.malhotra@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024MA005",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id12.jpg",
  },
  {
    _id: "du-013", name: "Manish Kumar", email: "manish.kumar@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2022EC019",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id13.jpg",
  },
  {
    _id: "du-014", name: "Tara Singh", email: "tara.singh@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2024CS110",
    isVerified: false, verificationStatus: "pending",
    idPhotoPath: "https://example.com/id14.jpg",
  },
  {
    _id: "du-015", name: "Kabir Khan", email: "kabir.khan@iiitp.ac.in",
    role: "student", institutionalId: "IIITP2023CS082",
    isVerified: true, verificationStatus: "approved",
    idPhotoPath: "https://example.com/id15.jpg",
  },
];

// ─── Demo All Borrows (for admin view) ───────────────────────────────────────
const DEMO_ALL_BORROWS = [
  { _id: "ab-001", book: { _id: "db-001", title: "Introduction to Algorithms", author: "Thomas H. Cormen" }, student: DEMO_USERS[0], issueDate: daysAgo(20), dueDate: daysLater(10), status: "borrowed", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-002", book: { _id: "db-002", title: "Operating System Concepts", author: "Abraham Silberschatz" }, student: DEMO_USERS[0], issueDate: daysAgo(35), dueDate: daysAgo(5), status: "overdue", returnDate: null, fineAmount: 25, finePaid: false },
  { _id: "ab-003", book: { _id: "db-004", title: "Computer Networks", author: "Andrew S. Tanenbaum" }, student: DEMO_USERS[1], issueDate: daysAgo(15), dueDate: daysLater(5), status: "borrowed", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-004", book: { _id: "db-005", title: "Discrete Mathematics and Its Applications", author: "Kenneth H. Rosen" }, student: DEMO_USERS[3], issueDate: daysAgo(5), dueDate: daysLater(15), status: "borrowed", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-005", book: { _id: "db-003", title: "Database System Concepts", author: "Silberschatz, Korth & Sudarshan" }, student: DEMO_USERS[1], issueDate: daysAgo(50), dueDate: daysAgo(20), status: "returned", returnDate: daysAgo(22), fineAmount: 0, finePaid: false },
  { _id: "ab-006", book: { _id: "db-007", title: "The Art of Computer Programming Vol.1", author: "Donald E. Knuth" }, student: DEMO_USERS[5], issueDate: daysAgo(65), dueDate: daysAgo(35), status: "returned", returnDate: daysAgo(33), fineAmount: 50, finePaid: true, finePaidAt: daysAgo(30) },
  { _id: "ab-007", book: { _id: "db-010", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig" }, student: DEMO_USERS[6], issueDate: daysAgo(3), dueDate: daysLater(27), status: "pending", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-008", book: { _id: "db-009", title: "Compilers: Principles, Techniques & Tools", author: "Alfred V. Aho" }, student: DEMO_USERS[4], issueDate: daysAgo(2), dueDate: daysLater(28), status: "pending", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-009", book: { _id: "db-008", title: "Computer Organization and Architecture", author: "William Stallings" }, student: DEMO_USERS[2], issueDate: daysAgo(42), dueDate: daysAgo(12), status: "overdue", returnDate: null, fineAmount: 60, finePaid: false },
  { _id: "ab-010", book: { _id: "db-011", title: "Software Engineering", author: "Ian Sommerville" }, student: DEMO_USERS[3], issueDate: daysAgo(28), dueDate: daysAgo(13), status: "overdue", returnDate: null, fineAmount: 65, finePaid: false },
  { _id: "ab-011", book: { _id: "db-012", title: "Linear Algebra and Its Applications", author: "Gilbert Strang" }, student: DEMO_USERS[7], issueDate: daysAgo(8), dueDate: daysLater(22), status: "pending", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-012", book: { _id: "db-014", title: "Object-Oriented Programming with Java", author: "Herbert Schildt" }, student: DEMO_USERS[5], issueDate: daysAgo(55), dueDate: daysAgo(25), status: "returned", returnDate: daysAgo(24), fineAmount: 0, finePaid: false },
  { _id: "ab-013", book: { _id: "db-016", title: "Clean Code", author: "Robert C. Martin" }, student: DEMO_USERS[8], issueDate: daysAgo(18), dueDate: daysLater(12), status: "borrowed", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-014", book: { _id: "db-017", title: "Introduction to the Theory of Computation", author: "Michael Sipser" }, student: DEMO_USERS[9], issueDate: daysAgo(40), dueDate: daysAgo(10), status: "overdue", returnDate: null, fineAmount: 85, finePaid: false },
  { _id: "ab-015", book: { _id: "db-018", title: "Pattern Recognition and Machine Learning", author: "Christopher M. Bishop" }, student: DEMO_USERS[11], issueDate: daysAgo(7), dueDate: daysLater(23), status: "borrowed", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-016", book: { _id: "db-019", title: "Advanced Engineering Mathematics", author: "Erwin Kreyszig" }, student: DEMO_USERS[12], issueDate: daysAgo(60), dueDate: daysAgo(30), status: "returned", returnDate: daysAgo(28), fineAmount: 20, finePaid: true, finePaidAt: daysAgo(25) },
  { _id: "ab-017", book: { _id: "db-020", title: "Principles of Physics", author: "Halliday & Resnick" }, student: DEMO_USERS[14], issueDate: daysAgo(2), dueDate: daysLater(28), status: "pending", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-018", book: { _id: "db-021", title: "The C Programming Language", author: "Brian W. Kernighan" }, student: DEMO_USERS[0], issueDate: daysAgo(45), dueDate: daysAgo(15), status: "overdue", returnDate: null, fineAmount: 90, finePaid: false },
  { _id: "ab-019", book: { _id: "db-023", title: "Deep Learning", author: "Ian Goodfellow" }, student: DEMO_USERS[8], issueDate: daysAgo(1), dueDate: daysLater(29), status: "pending", returnDate: null, fineAmount: 0, finePaid: false },
  { _id: "ab-020", book: { _id: "db-025", title: "Computer Graphics: Principles and Practice", author: "John F. Hughes" }, student: DEMO_USERS[9], issueDate: daysAgo(12), dueDate: daysLater(18), status: "borrowed", returnDate: null, fineAmount: 0, finePaid: false },
];

// ─── Admin Stats ─────────────────────────────────────────────────────────────
const DEMO_ADMIN_STATS = {
  totalUsers: DEMO_USERS.length,
  totalBooks: DEMO_BOOKS.length,
  totalBorrows: DEMO_ALL_BORROWS.length,
  overdue: DEMO_ALL_BORROWS.filter(b => b.status === "overdue").length,
};

// ─── Admin Fines ─────────────────────────────────────────────────────────────
const finesByStudent = [
  { _id: "du-001", student: { name: "Arjun Sharma", institutionalId: "IIITP2024CS042" }, totalFines: 115, pending: 115, received: 0 },
  { _id: "du-003", student: { name: "Rahul Mehta",  institutionalId: "IIITP2024CS088" }, totalFines: 60, pending: 60, received: 0 },
  { _id: "du-004", student: { name: "Sneha Gupta",  institutionalId: "IIITP2023CS031" }, totalFines: 65, pending: 65, received: 0 },
  { _id: "du-006", student: { name: "Ananya Roy",   institutionalId: "IIITP2023CS055" }, totalFines: 50, pending: 0,   received: 50 },
  { _id: "du-010", student: { name: "Neha Verma",   institutionalId: "IIITP2024CS002" }, totalFines: 85, pending: 85, received: 0 },
  { _id: "du-013", student: { name: "Manish Kumar", institutionalId: "IIITP2022EC019" }, totalFines: 20, pending: 0,   received: 20 },
];

const totalFinesCalculated = finesByStudent.reduce((acc, curr) => acc + curr.totalFines, 0);
const pendingFinesCalculated = finesByStudent.reduce((acc, curr) => acc + curr.pending, 0);
const receivedFinesCalculated = finesByStudent.reduce((acc, curr) => acc + curr.received, 0);

const DEMO_ADMIN_FINES = {
  totals: { 
    totalFines: totalFinesCalculated, 
    pendingFines: pendingFinesCalculated, 
    receivedFines: receivedFinesCalculated 
  },
  byStudent: finesByStudent,
};

// ─── Mock API Response Handler ────────────────────────────────────────────────
// Called by the custom axios adapter when isDemoMode is active.
// Returns mock data matching the exact shape of real API responses.
export const getMockResponse = (url = "", method = "get", params = {}) => {
  const m = method.toLowerCase();
  
  // Extract path and query string
  const urlObj = new URL(url, "http://localhost");
  const path = urlObj.pathname.replace(/^\/api/, "");
  
  // Merge URL query params into the params object
  const mergedParams = { ...params };
  urlObj.searchParams.forEach((value, key) => {
    mergedParams[key] = value;
  });

  // ── Write operations ────────────────────────────────────────────────────────
  if (["post", "put", "patch", "delete"].includes(m)) {
    if (path.includes("/auth/logout")) return {};
    if (path === "/auth/me") {
      // Profile update — return same demo user shape
      const role = sessionStorage.getItem("demoRole");
      return role === "admin" ? DEMO_ADMIN : DEMO_STUDENT;
    }
    // For all other writes, return a generic success
    return { success: true, message: "Demo mode: action acknowledged." };
  }

  // ── GET /auth/me ────────────────────────────────────────────────────────────
  if (path === "/auth/me") {
    const role = sessionStorage.getItem("demoRole");
    return role === "admin" ? DEMO_ADMIN : DEMO_STUDENT;
  }

  // ── GET /books ──────────────────────────────────────────────────────────────
  if (path === "/books" || path === "/books/") {
    const search = (mergedParams?.search || "").toLowerCase();
    if (search) {
      return DEMO_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search) ||
          (b.genre || "").toLowerCase().includes(search)
      );
    }
    return DEMO_BOOKS;
  }

  // ── GET /borrows/fines/me ───────────────────────────────────────────────────
  if (path === "/borrows/fines/me") return DEMO_FINES_RESPONSE;

  // ── GET /borrows/me ─────────────────────────────────────────────────────────
  if (path === "/borrows/me") return DEMO_STUDENT_BORROWS;

  // ── GET /admin/stats ────────────────────────────────────────────────────────
  if (path === "/admin/stats") return DEMO_ADMIN_STATS;

  // ── GET /admin/fines ────────────────────────────────────────────────────────
  if (path === "/admin/fines" || path.startsWith("/admin/fines/")) {
    return DEMO_ADMIN_FINES;
  }

  // ── GET /admin/borrows ──────────────────────────────────────────────────────
  if (path === "/admin/borrows" || path.startsWith("/admin/borrows")) {
    const status = mergedParams?.status;
    if (status) return DEMO_ALL_BORROWS.filter((b) => b.status === status);
    return DEMO_ALL_BORROWS;
  }

  // ── GET /admin/users ────────────────────────────────────────────────────────
  if (path === "/admin/users" || path.startsWith("/admin/users")) {
    const verificationStatus = mergedParams?.verificationStatus;
    if (verificationStatus) {
      return DEMO_USERS.filter((u) => u.verificationStatus === verificationStatus);
    }
    return DEMO_USERS;
  }

  // ── GET /admin/report/csv or /admin/report/pdf ──────────────────────────────
  if (path.startsWith("/admin/report/")) {
    // Return empty — pages handle gracefully when these don't work
    return {};
  }

  // ── Chatbot ─────────────────────────────────────────────────────────────────
  if (path.startsWith("/chatbot") || path.includes("chatbot")) {
    return {
      response:
        "Hi! I'm the BookBank AI assistant. In demo mode I can answer general questions about library policies. Sign up to access personalized help.",
    };
  }

  // ── Fallback ─────────────────────────────────────────────────────────────────
  return {};
};
