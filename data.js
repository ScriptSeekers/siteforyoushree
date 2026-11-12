// Your syllabus and study plan live here.
// Edit chapter names or dates in this file if your college changes anything.
window.EXAM_DATA = {
  examDates: [
    { date: "2026-11-25", subject: "English" },
    { date: "2026-11-26", subject: "Economics" },
    { date: "2026-11-27", subject: "Hindi" },
    { date: "2026-11-28", subject: "Book-Keeping & Accountancy" },
    { date: "2026-11-30", subject: "Organisation of Commerce & Management" },
    { date: "2026-12-01", subject: "Maths / Statistics" }
  ],
  subjects: [
    {
      id: "bk", name: "Book-Keeping & Accountancy", short: "BK", priority: "high", chapters: [
        "Introduction to Partnership and Partnership Final Accounts",
        "Accounts of Not-for-Profit Concerns",
        "Admission of Partner",
        "Retirement of Partner",
        "Death of Partner",
        "Dissolution of Partnership Firm",
        "Bills of Exchange",
        "Company Accounts – Issue of Shares",
        "Analysis of Financial Statements",
        "Computer in Accounting"
      ]
    },
    {
      id: "maths1", name: "Maths 1", short: "Maths 1", priority: "high", chapters: [
        "Mathematical Logic", "Matrices", "Differentiation", "Application of Derivatives",
        "Integration", "Definite Integration", "Application of Definite Integration",
        "Differential Equations and Applications"
      ]
    },
    {
      id: "maths2", name: "Maths 2", short: "Maths 2", priority: "high", chapters: [
        "Commission, Brokerage and Discount", "Insurance and Annuity", "Linear Regression",
        "Time Series", "Index Numbers", "Linear Programming", "Assignment Problem and Sequencing",
        "Probability Distribution"
      ]
    },
    {
      id: "economics", name: "Economics", short: "Economics", priority: "medium", chapters: [
        "Introduction to Micro & Macro Economics", "Utility Analysis", "Demand Analysis",
        "Elasticity of Demand", "Supply Analysis", "Forms of Market", "Index Numbers",
        "National Income", "Public Finance in India", "Money Market and Capital Market in India",
        "Foreign Trade of India"
      ]
    },
    {
      id: "ocm", name: "Organisation of Commerce & Management", short: "OCM", priority: "medium", chapters: [
        "Principles of Management", "Functions of Management", "Entrepreneurship Development",
        "Business Services", "Emerging Models of Business", "Social Responsibilities of Business",
        "Consumer Protection", "Marketing"
      ]
    },
    {
      id: "english", name: "English", short: "English", priority: "medium", chapters: [
        "An Astrologer's Day", "On Saying Please", "The Cop and the Anthem", "Big Data – Big Insight",
        "The New Dress", "Into the Wild", "Why We Travel", "Voyaging Towards Excellence",
        "Song of the Open Road", "Indian Weavers", "The Inchcape Rock", "Have You Earned Your Tomorrow",
        "Father Returning Home", "Money", "She Walks in Beauty", "Small Town and Rivers"
      ]
    }
  ],
  plan: [
    ["2026-11-13", "bk", "english", "BK Chapters 1–2", "English lessons 1–4"],
    ["2026-11-14", "maths2", "economics", "Maths 2 Chapters 1–2", "Economics Chapters 1–3"],
    ["2026-11-15", "bk", "maths1", "BK Chapters 3–4", "Maths 1 Chapters 1–2"],
    ["2026-11-16", "english", "ocm", "English lessons 5–8", "OCM Chapters 1–3"],
    ["2026-11-17", "bk", "maths2", "BK Chapters 5–6", "Maths 2 Chapters 3–4"],
    ["2026-11-18", "economics", "maths1", "Economics Chapters 4–6", "Maths 1 Chapters 3–4"],
    ["2026-11-19", "bk", "ocm", "BK Chapters 7–8", "OCM Chapters 4–6"],
    ["2026-11-20", "english", "maths2", "English poems 1–4", "Maths 2 Chapters 5–6"],
    ["2026-11-21", "bk", "maths1", "BK Chapters 9–10", "Maths 1 Chapters 5–6"],
    ["2026-11-22", "economics", "ocm", "Economics Chapters 7–10", "OCM Chapters 7–8"],
    ["2026-11-23", "maths2", "english", "Maths 2 Chapters 7–8", "English poems 5–8"],
    ["2026-11-24", "maths1", "english", "Maths 1 Chapters 7–8", "English full revision + mock test"]
  ]
};