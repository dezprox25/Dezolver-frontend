/**
 * Central mock data store for all modules.
 * All data is mutable so CRUD operations update local state.
 */

import type { Tenant, Cohort, Invitation } from '@/types/tenancy.types'
import type { Room, Course, Problem, MediaAsset } from '@/types/content.types'
import type { Assessment, Submission, FlaggedSubmission } from '@/types/assessment.types'
import type { Event, Registration, LeaderboardEntry } from '@/types/event.types'
import type { Certificate, CertificateTemplate, IssuanceRule } from '@/types/certificate.types'
import type { Path, CareerMap } from '@/types/path.types'
import type { Plan, Subscription, Invoice, Payment, CollegePayout } from '@/types/billing.types'
import type { Syllabus, SyllabusOverlay, Domain } from '@/types/curriculum.types'
import type { AuditEntry, FeatureFlag } from '@/types/platform.types'

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
const daysFrom = (d: number) => new Date(Date.now() + d * 86400000).toISOString()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(prefix: string, n: number | string) {
  return `${prefix}-${String(n).padStart(3, '0')}`
}

// ─── Tenants ──────────────────────────────────────────────────────────────────

const COLLEGE_NAMES = [
  'IIT Madras', 'IIT Delhi', 'IIT Bombay', 'IIT Kharagpur', 'IIT Kanpur',
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'NIT Trichy', 'NIT Calicut',
  'NIT Warangal', 'NIT Surathkal', 'VIT Vellore', 'VIT Chennai', 'SRM Chennai',
  'SRM Trichy', 'Anna University', 'KL University', 'Amrita Coimbatore',
  'Amrita Bangalore', 'BITS Pilani', 'BITS Goa', 'Manipal Institute',
  'Symbiosis Pune', 'SASTRA Thanjavur', 'PSG Tech Coimbatore',
  'CIT Coimbatore', 'GCT Coimbatore', 'Thiagarajar College',
  'Bannari Amman Institute', 'KEC Erode', 'REC Chennai', 'Kongu Engineering',
  'Vel Tech Chennai', 'Panimalar Engineering', 'Sri Krishna Engineering',
  'Jeppiaar Engineering', 'Sathyabama University', 'Hindustan Institute',
  'Vels University', 'Crescent Engineering', 'Saveetha Engineering',
  'Easwari Engineering', 'Sri Venkateswara College', 'Rajalakshmi Engineering',
  'Sri Eshwar College', 'Karpagam Academy', 'Adithya Engineering',
  'Jerusalem College', 'Mepco Schlenk Engineering',
]

const STATUSES = ['active', 'active', 'active', 'trial', 'active', 'active', 'suspended'] as const
const PLANS = ['professional', 'professional', 'enterprise', 'starter', 'professional'] as const

export const mockTenants: Tenant[] = COLLEGE_NAMES.map((name, i) => ({
  id: uid('tenant', i + 1),
  kind: 'college' as const,
  name,
  subdomain: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20),
  status: STATUSES[i % STATUSES.length],
  primaryContactEmail: `admin@${name.toLowerCase().replace(/\s+/g, '').slice(0, 10)}.edu.in`,
  primaryDomain: `${name.toLowerCase().replace(/\s+/g, '').slice(0, 10)}.edu.in`,
  expectedStudentCount: [500, 800, 1200, 2000, 3000, 1500, 2500][i % 7],
  createdAt: daysAgo(30 + i * 5),
  statusChangedAt: daysAgo(i * 3),
  subscription: {
    id: uid('sub', i + 1),
    planCode: PLANS[i % PLANS.length] as 'professional' | 'enterprise' | 'starter',
    status: i % 7 === 3 ? 'trial' : 'active',
    trialEndsAt: i % 7 === 3 ? daysFrom(14) : null,
    currentPeriodEnd: daysFrom(90 + (i % 5) * 30),
  },
}))

// Platform tenant
mockTenants.unshift({
  id: 'tenant-platform-dezolver-001',
  kind: 'direct',
  name: 'Dezolver Platform',
  subdomain: 'platform',
  status: 'active',
  primaryContactEmail: 'admin@dezolver.com',
  primaryDomain: 'dezolver.com',
  createdAt: daysAgo(365),
  statusChangedAt: daysAgo(365),
  subscription: {
    id: 'sub-platform-001',
    planCode: 'unlimited' as never,
    status: 'active',
    trialEndsAt: null,
    currentPeriodEnd: daysFrom(365),
  },
})

// ─── Cohorts ──────────────────────────────────────────────────────────────────

export const mockCohorts: Cohort[] = [
  { id: 'cohort-cse-2025', tenantId: 'tenant-college-iitm-001', name: 'CSE 2025', academicYear: '2024-25', memberCount: 186, createdAt: daysAgo(120) },
  { id: 'cohort-cse-2026', tenantId: 'tenant-college-iitm-001', name: 'CSE 2026', academicYear: '2025-26', memberCount: 204, createdAt: daysAgo(30) },
  { id: 'cohort-ece-2025', tenantId: 'tenant-college-iitm-001', name: 'ECE 2025', academicYear: '2024-25', memberCount: 122, createdAt: daysAgo(120) },
  { id: 'cohort-aiml-2025', tenantId: 'tenant-college-iitm-001', name: 'AI/ML 2025', academicYear: '2024-25', memberCount: 98, createdAt: daysAgo(90) },
  { id: 'cohort-mba-2025', tenantId: 'tenant-college-iitm-001', name: 'MBA Tech 2025', academicYear: '2024-25', memberCount: 75, createdAt: daysAgo(60) },
]

// ─── Invitations ──────────────────────────────────────────────────────────────

const SAMPLE_EMAILS = [
  'raj.patel@student.iitm.ac.in', 'ananya.singh@student.iitm.ac.in',
  'vikram.kumar@student.iitm.ac.in', 'preethi.nair@student.iitm.ac.in',
  'rohit.mehta@faculty.iitm.ac.in', 'deepa.rajan@faculty.iitm.ac.in',
  'suresh.babu@student.iitm.ac.in', 'nisha.thomas@student.iitm.ac.in',
  'karthik.v@student.iitm.ac.in', 'lakshmi.priya@student.iitm.ac.in',
]

export const mockInvitations: Invitation[] = SAMPLE_EMAILS.map((email, i) => ({
  id: uid('inv', i + 1),
  tenantId: 'tenant-college-iitm-001',
  email,
  role: i >= 4 && i <= 5 ? 'faculty' : 'student',
  cohortId: i < 4 ? 'cohort-cse-2025' : i < 6 ? null : 'cohort-cse-2026',
  cohortName: i < 4 ? 'CSE 2025' : i < 6 ? null : 'CSE 2026',
  status: i < 6 ? 'accepted' : i < 8 ? 'pending' : 'expired',
  expiresAt: i < 6 ? daysAgo(1) : daysFrom(7),
  createdAt: daysAgo(14 - i),
  acceptedAt: i < 6 ? daysAgo(14 - i - 2) : null,
}))

// ─── Persons (platform admin view) ───────────────────────────────────────────

const PERSON_NAMES = [
  'Arjun Sharma', 'Priya Krishnamurthy', 'Dr. Ramesh Babu', 'Kavya Reddy',
  'Suresh Kumar', 'Anitha Rajan', 'Mohit Gupta', 'Sindhu Menon',
  'Rajesh Pillai', 'Divya Srinivasan', 'Arun Prakash', 'Meera Nair',
  'Vivek Chandrasekaran', 'Lakshmi Venkataraman', 'Karthik Subramanian',
  'Deepa Murugavel', 'Sanjay Patel', 'Nithya Ravi', 'Balaji Krishnan',
  'Preethi Sundaram',
]

export const mockPersons = PERSON_NAMES.map((name, i) => ({
  id: uid('person', i + 1),
  primaryEmail: `${name.toLowerCase().replace(/\s+/g, '.').replace('dr.', '').trim()}@dezolver.com`,
  displayName: name,
  platformRating: [3200, 1400, 920, 487, 750, 1100, 620, 890, 1240, 560, 1680, 430, 2100, 780, 1350, 540, 1890, 320, 1120, 660][i],
  tenantId: i < 2 ? 'tenant-platform-dezolver-001' : 'tenant-college-iitm-001',
  createdAt: daysAgo(90 + i * 3),
}))

// ─── Rooms ────────────────────────────────────────────────────────────────────

const ROOM_TITLES = [
  { title: 'Introduction to Arrays', difficulty: 'beginner', domain: 'cse', tags: ['arrays', 'dsa'], mins: 30 },
  { title: 'Linked Lists Fundamentals', difficulty: 'beginner', domain: 'cse', tags: ['linked-list', 'dsa'], mins: 45 },
  { title: 'Binary Search Deep Dive', difficulty: 'intermediate', domain: 'cse', tags: ['binary-search', 'algorithms'], mins: 60 },
  { title: 'Dynamic Programming Basics', difficulty: 'intermediate', domain: 'cse', tags: ['dp', 'algorithms'], mins: 90 },
  { title: 'Graph Traversal Algorithms', difficulty: 'intermediate', domain: 'cse', tags: ['graphs', 'bfs', 'dfs'], mins: 75 },
  { title: 'Advanced DP Patterns', difficulty: 'advanced', domain: 'cse', tags: ['dp', 'memoization'], mins: 120 },
  { title: 'System Design Fundamentals', difficulty: 'advanced', domain: 'cse', tags: ['system-design'], mins: 90 },
  { title: 'React Hooks Deep Dive', difficulty: 'intermediate', domain: 'it', tags: ['react', 'frontend'], mins: 60 },
  { title: 'Node.js REST API Design', difficulty: 'intermediate', domain: 'it', tags: ['nodejs', 'api', 'backend'], mins: 75 },
  { title: 'SQL and Database Design', difficulty: 'beginner', domain: 'cse', tags: ['sql', 'databases'], mins: 45 },
  { title: 'Machine Learning Foundations', difficulty: 'intermediate', domain: 'aiml', tags: ['ml', 'python'], mins: 90 },
  { title: 'Neural Networks & Deep Learning', difficulty: 'advanced', domain: 'aiml', tags: ['dl', 'pytorch'], mins: 120 },
  { title: 'Computer Networks Basics', difficulty: 'beginner', domain: 'cse', tags: ['networking', 'tcp-ip'], mins: 45 },
  { title: 'Operating Systems Concepts', difficulty: 'intermediate', domain: 'cse', tags: ['os', 'processes'], mins: 60 },
  { title: 'Data Structures: Trees', difficulty: 'intermediate', domain: 'cse', tags: ['trees', 'bst', 'dsa'], mins: 75 },
  { title: 'Sorting Algorithms', difficulty: 'beginner', domain: 'cse', tags: ['sorting', 'algorithms'], mins: 45 },
  { title: 'Heap & Priority Queue', difficulty: 'intermediate', domain: 'cse', tags: ['heap', 'dsa'], mins: 60 },
  { title: 'Python for Data Science', difficulty: 'beginner', domain: 'aiml', tags: ['python', 'numpy', 'pandas'], mins: 75 },
  { title: 'Docker & Containerization', difficulty: 'intermediate', domain: 'it', tags: ['docker', 'devops'], mins: 60 },
  { title: 'TypeScript Fundamentals', difficulty: 'beginner', domain: 'it', tags: ['typescript', 'frontend'], mins: 45 },
  { title: 'Microservices Architecture', difficulty: 'advanced', domain: 'it', tags: ['microservices', 'architecture'], mins: 90 },
  { title: 'Recursion & Backtracking', difficulty: 'intermediate', domain: 'cse', tags: ['recursion', 'dsa'], mins: 60 },
  { title: 'String Algorithms', difficulty: 'intermediate', domain: 'cse', tags: ['strings', 'kmp'], mins: 60 },
  { title: 'Competitive Programming Tricks', difficulty: 'expert', domain: 'cse', tags: ['cp', 'advanced'], mins: 120 },
  { title: 'Introduction to Algorithms', difficulty: 'beginner', domain: 'cse', tags: ['algorithms'], mins: 30 },
]

export const mockRooms: Room[] = ROOM_TITLES.map((r, i) => ({
  id: uid('room', i + 1),
  slug: `${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
  title: r.title,
  summary: `A comprehensive room covering ${r.title.toLowerCase()}. Includes theory, examples, and practice exercises.`,
  difficulty: r.difficulty as Room['difficulty'],
  estimatedMinutes: r.mins,
  domainCodes: [r.domain],
  skillTags: r.tags,
  status: i < 20 ? 'published' : 'draft',
  currentVersion: i < 20 ? {
    id: uid('rv', i + 1),
    versionNumber: i < 10 ? 3 : 1,
    status: 'published',
    publishedAt: daysAgo(30 - i),
    createdAt: daysAgo(60 - i),
  } : null,
  body: [
    { type: 'heading', level: 2, content: `Understanding ${r.title}` },
    { type: 'text', content: `In this room, you will learn about ${r.title.toLowerCase()} with hands-on exercises and real-world examples.` },
    { type: 'callout', tone: 'info', content: 'Complete all exercises to unlock the next room in the path.' },
    { type: 'code', language: 'python', content: `# Example: ${r.title}\n# Implement your solution here\ndef solution():\n    pass\n` },
    { type: 'text', content: 'Practice regularly and refer to the hints if you get stuck. Good luck!' },
  ],
  authorId: 'user-platform-admin-001',
  authorName: 'Arjun Sharma',
  publishedAt: i < 20 ? daysAgo(30 - i) : null,
  createdAt: daysAgo(90 - i),
  updatedAt: daysAgo(10 + i),
}))

// ─── Courses ──────────────────────────────────────────────────────────────────

export const mockCourses: Course[] = [
  {
    id: 'course-dsa-001',
    slug: 'data-structures-algorithms-001',
    title: 'Data Structures & Algorithms',
    summary: 'Master the fundamentals and advanced concepts of DSA with 150+ problems.',
    difficulty: 'intermediate',
    domainCodes: ['cse'],
    skillTags: ['dsa', 'algorithms', 'arrays', 'graphs', 'dp'],
    status: 'published',
    rooms: mockRooms.slice(0, 8).map((r, idx) => ({ id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, position: idx + 1 })),
    roomCount: 8,
    estimatedMinutes: 480,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
  },
  {
    id: 'course-webdev-001',
    slug: 'full-stack-web-development-001',
    title: 'Full Stack Web Development',
    summary: 'Build modern web applications with React, Node.js, and TypeScript.',
    difficulty: 'intermediate',
    domainCodes: ['it'],
    skillTags: ['react', 'nodejs', 'typescript', 'api'],
    status: 'published',
    rooms: mockRooms.slice(7, 12).map((r, idx) => ({ id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, position: idx + 1 })),
    roomCount: 5,
    estimatedMinutes: 315,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
  {
    id: 'course-ml-001',
    slug: 'machine-learning-fundamentals-001',
    title: 'Machine Learning Fundamentals',
    summary: 'From Python basics to building neural networks. Hands-on with real datasets.',
    difficulty: 'advanced',
    domainCodes: ['aiml'],
    skillTags: ['ml', 'python', 'pytorch', 'numpy'],
    status: 'published',
    rooms: mockRooms.slice(10, 15).map((r, idx) => ({ id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, position: idx + 1 })),
    roomCount: 5,
    estimatedMinutes: 390,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(3),
  },
  {
    id: 'course-cp-001',
    slug: 'competitive-programming-001',
    title: 'Competitive Programming',
    summary: 'Advanced algorithms and techniques for ICPC and online judge competitions.',
    difficulty: 'expert',
    domainCodes: ['cse'],
    skillTags: ['cp', 'advanced', 'graphs', 'dp'],
    status: 'published',
    rooms: mockRooms.slice(4, 9).map((r, idx) => ({ id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, position: idx + 1 })),
    roomCount: 5,
    estimatedMinutes: 435,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  },
]

// ─── Problems ─────────────────────────────────────────────────────────────────

const PROBLEM_LIST = [
  { title: 'Two Sum', difficulty: 'easy', topics: ['arrays', 'hash-map'] },
  { title: 'Reverse Linked List', difficulty: 'easy', topics: ['linked-list'] },
  { title: 'Valid Parentheses', difficulty: 'easy', topics: ['stack', 'strings'] },
  { title: 'Maximum Subarray', difficulty: 'medium', topics: ['dp', 'arrays'] },
  { title: 'Merge Two Sorted Lists', difficulty: 'easy', topics: ['linked-list', 'sorting'] },
  { title: 'Binary Search', difficulty: 'easy', topics: ['binary-search'] },
  { title: 'Climbing Stairs', difficulty: 'easy', topics: ['dp'] },
  { title: 'Best Time to Buy and Sell Stock', difficulty: 'easy', topics: ['arrays', 'greedy'] },
  { title: 'Symmetric Tree', difficulty: 'easy', topics: ['trees', 'recursion'] },
  { title: 'Maximum Depth of Binary Tree', difficulty: 'easy', topics: ['trees', 'bfs'] },
  { title: 'Number of Islands', difficulty: 'medium', topics: ['graphs', 'dfs'] },
  { title: 'Course Schedule', difficulty: 'medium', topics: ['graphs', 'topological-sort'] },
  { title: 'Longest Common Subsequence', difficulty: 'medium', topics: ['dp', 'strings'] },
  { title: 'Word Break', difficulty: 'medium', topics: ['dp', 'strings'] },
  { title: 'Coin Change', difficulty: 'medium', topics: ['dp'] },
  { title: 'House Robber', difficulty: 'medium', topics: ['dp'] },
  { title: 'Longest Increasing Subsequence', difficulty: 'medium', topics: ['dp', 'binary-search'] },
  { title: 'Rotting Oranges', difficulty: 'medium', topics: ['graphs', 'bfs'] },
  { title: 'Container With Most Water', difficulty: 'medium', topics: ['two-pointers', 'arrays'] },
  { title: 'Product of Array Except Self', difficulty: 'medium', topics: ['arrays'] },
  { title: 'Spiral Matrix', difficulty: 'medium', topics: ['arrays', 'simulation'] },
  { title: 'Jump Game', difficulty: 'medium', topics: ['greedy', 'dp'] },
  { title: 'Merge Intervals', difficulty: 'medium', topics: ['arrays', 'sorting'] },
  { title: 'Non-overlapping Intervals', difficulty: 'medium', topics: ['greedy', 'intervals'] },
  { title: 'Meeting Rooms II', difficulty: 'medium', topics: ['heap', 'sorting'] },
  { title: 'Search in Rotated Sorted Array', difficulty: 'medium', topics: ['binary-search'] },
  { title: 'Find Minimum in Rotated Sorted Array', difficulty: 'medium', topics: ['binary-search'] },
  { title: 'Trapping Rain Water', difficulty: 'hard', topics: ['arrays', 'two-pointers', 'stack'] },
  { title: 'Median of Two Sorted Arrays', difficulty: 'hard', topics: ['binary-search', 'arrays'] },
  { title: 'Serialize and Deserialize Binary Tree', difficulty: 'hard', topics: ['trees', 'bfs'] },
]

export const mockProblems: Problem[] = PROBLEM_LIST.map((p, i) => ({
  id: uid('prob', i + 1),
  slug: `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
  title: p.title,
  difficulty: p.difficulty as Problem['difficulty'],
  topics: p.topics,
  companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'].slice(0, (i % 4) + 1),
  status: 'published' as const,
  statementMd: `## Problem\n\n${p.title}\n\nGiven an input, solve the problem efficiently.\n\n## Examples\n\n\`\`\`\nInput: [1, 2, 3]\nOutput: 6\n\`\`\`\n\n## Constraints\n- 1 ≤ n ≤ 10^5\n- -10^9 ≤ arr[i] ≤ 10^9`,
  inputFormat: 'First line contains n. Second line contains n space-separated integers.',
  outputFormat: 'Print the answer on a single line.',
  constraints: '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9',
  allowedLanguages: ['python', 'java', 'cpp', 'c', 'javascript'],
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  testCases: [
    { id: uid('tc', i * 2 + 1), index: 0, isSample: true, input: '3\n1 2 3', expectedOutput: '6', weight: 1, explanation: 'Sum of all elements' },
    { id: uid('tc', i * 2 + 2), index: 1, isSample: false, input: '5\n-1 0 1 2 -2', expectedOutput: '0', weight: 1, explanation: null },
  ],
  createdAt: daysAgo(60 + i),
  updatedAt: daysAgo(i + 1),
}))

// ─── Assessments ──────────────────────────────────────────────────────────────

export const mockAssessments: Assessment[] = [
  {
    id: 'assess-coding-001',
    title: 'DSA Fundamentals Assessment',
    description: 'Test your understanding of arrays, linked lists, and basic algorithms.',
    kind: 'coding_problem',
    problemId: mockProblems[0].id,
    problem: mockProblems[0],
    maxAttempts: 3,
    timeLimitMinutes: 60,
    collectAntiCheat: true,
    status: 'published',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
    myAttemptCount: 1,
    myBestVerdict: 'accepted',
  },
  {
    id: 'assess-coding-002',
    title: 'Graph Algorithms Challenge',
    description: 'Advanced graph problems including BFS, DFS, and shortest path.',
    kind: 'coding_problem',
    problemId: mockProblems[10].id,
    problem: mockProblems[10],
    maxAttempts: 2,
    timeLimitMinutes: 90,
    collectAntiCheat: true,
    status: 'published',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(3),
    myAttemptCount: 0,
    myBestVerdict: null,
  },
  {
    id: 'assess-mcq-001',
    title: 'Computer Networks MCQ',
    description: 'Multiple choice questions on networking concepts.',
    kind: 'mcq_single',
    maxAttempts: 1,
    timeLimitMinutes: 30,
    collectAntiCheat: false,
    status: 'published',
    questions: [
      { id: 'q-1', kind: 'mcq_single', text: 'Which layer of the OSI model handles routing?', options: [{ id: 'a', text: 'Physical' }, { id: 'b', text: 'Data Link' }, { id: 'c', text: 'Network' }, { id: 'd', text: 'Transport' }], correctOptionId: 'c', weight: 1 },
      { id: 'q-2', kind: 'mcq_single', text: 'What does TCP stand for?', options: [{ id: 'a', text: 'Transfer Control Protocol' }, { id: 'b', text: 'Transmission Control Protocol' }, { id: 'c', text: 'Transport Channel Protocol' }, { id: 'd', text: 'Terminal Control Protocol' }], correctOptionId: 'b', weight: 1 },
      { id: 'q-3', kind: 'mcq_single', text: 'Which protocol operates at the application layer?', options: [{ id: 'a', text: 'TCP' }, { id: 'b', text: 'IP' }, { id: 'c', text: 'HTTP' }, { id: 'd', text: 'Ethernet' }], correctOptionId: 'c', weight: 1 },
      { id: 'q-4', kind: 'mcq_single', text: 'What is the default port for HTTPS?', options: [{ id: 'a', text: '80' }, { id: 'b', text: '443' }, { id: 'c', text: '8080' }, { id: 'd', text: '3000' }], correctOptionId: 'b', weight: 1 },
      { id: 'q-5', kind: 'mcq_single', text: 'Which of these is a connection-oriented protocol?', options: [{ id: 'a', text: 'UDP' }, { id: 'b', text: 'IP' }, { id: 'c', text: 'TCP' }, { id: 'd', text: 'ICMP' }], correctOptionId: 'c', weight: 1 },
    ],
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(2),
    myAttemptCount: 0,
    myBestVerdict: null,
  },
  {
    id: 'assess-mcq-002',
    title: 'Operating Systems Quiz',
    description: 'Test your OS knowledge: processes, memory management, scheduling.',
    kind: 'mcq_multi',
    maxAttempts: 2,
    timeLimitMinutes: 45,
    collectAntiCheat: false,
    status: 'published',
    questions: [
      { id: 'q-os-1', kind: 'mcq_multi', text: 'Which of the following are CPU scheduling algorithms?', options: [{ id: 'a', text: 'Round Robin' }, { id: 'b', text: 'FIFO' }, { id: 'c', text: 'SHA-256' }, { id: 'd', text: 'Shortest Job First' }], correctOptionIds: ['a', 'b', 'd'], weight: 2 },
      { id: 'q-os-2', kind: 'mcq_single', text: 'What causes a deadlock?', options: [{ id: 'a', text: 'Too much memory' }, { id: 'b', text: 'Circular resource waiting' }, { id: 'c', text: 'Fast CPU' }, { id: 'd', text: 'Multiple cores' }], correctOptionId: 'b', weight: 1 },
    ],
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(1),
    myAttemptCount: 1,
    myBestVerdict: 'partial',
  },
  {
    id: 'assess-coding-003',
    title: 'Dynamic Programming Mastery',
    description: 'Solve 1 DP problem under time pressure.',
    kind: 'coding_problem',
    problemId: mockProblems[3].id,
    problem: mockProblems[3],
    maxAttempts: 5,
    timeLimitMinutes: 120,
    collectAntiCheat: false,
    status: 'draft',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
    myAttemptCount: 0,
    myBestVerdict: null,
  },
  {
    id: 'assess-coding-004',
    title: 'Mid-Semester Coding Exam',
    description: 'Official mid-semester assessment covering all topics from weeks 1-7.',
    kind: 'coding_problem',
    problemId: mockProblems[14].id,
    problem: mockProblems[14],
    maxAttempts: 1,
    timeLimitMinutes: 180,
    collectAntiCheat: true,
    status: 'published',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(40),
    myAttemptCount: 1,
    myBestVerdict: 'accepted',
  },
]

// ─── Submissions ──────────────────────────────────────────────────────────────

const VERDICTS: Submission['verdict'][] = ['accepted', 'wrong_answer', 'accepted', 'time_limit_exceeded', 'accepted', 'runtime_error', 'accepted', 'accepted', 'compilation_error', 'accepted']

export const mockSubmissions: Submission[] = Array.from({ length: 50 }, (_, i) => ({
  id: uid('sub-detail', i + 1),
  assessmentId: mockAssessments[i % mockAssessments.length].id,
  assessmentTitle: mockAssessments[i % mockAssessments.length].title,
  userId: 'user-student-001',
  kind: i % 3 === 0 ? 'mcq_single' : 'coding_problem',
  verdict: VERDICTS[i % VERDICTS.length],
  status: 'completed',
  score: VERDICTS[i % VERDICTS.length] === 'accepted' ? 100 : VERDICTS[i % VERDICTS.length] === 'partial' ? 60 : 0,
  testCasesPassed: VERDICTS[i % VERDICTS.length] === 'accepted' ? 10 : VERDICTS[i % VERDICTS.length] === 'partial' ? 6 : 2,
  testCasesTotal: 10,
  executionTimeMs: 45 + (i * 7) % 200,
  memoryUsedKb: 12800 + (i * 512) % 8192,
  language: ['python', 'java', 'cpp', 'javascript'][i % 4],
  attemptNumber: (i % 3) + 1,
  submittedAt: daysAgo(i * 0.5),
  gradedAt: daysAgo(i * 0.5 - 0.01),
  isFlagged: i % 15 === 0,
}))

export const mockFlaggedSubmissions: FlaggedSubmission[] = mockSubmissions
  .filter((s) => s.isFlagged)
  .map((s, i) => ({
    id: uid('flag', i + 1),
    submissionId: s.id,
    userId: s.userId,
    assessmentId: s.assessmentId,
    assessmentTitle: s.assessmentTitle,
    suspicionScore: 70 + (i * 8) % 30,
    signals: { tabBlurCount: 5 + i, windowBlurCount: 3 + i, pasteEventCount: 2 + i, timeOnTaskMs: 120000 },
    decision: i === 0 ? 'cleared' : null,
    reviewNote: i === 0 ? 'Reviewed — normal behavior under exam conditions.' : null,
    reviewedAt: i === 0 ? daysAgo(1) : null,
    reviewedByUserId: i === 0 ? 'user-faculty-001' : null,
    createdAt: daysAgo(i + 1),
    submission: s,
  }))

// ─── Events ───────────────────────────────────────────────────────────────────

export const mockEvents: Event[] = [
  {
    id: 'event-001',
    kind: 'competition',
    title: 'Dezolver Code Sprint 2026',
    description: 'The premier coding competition for engineering students. 3 hours, 5 problems, winner takes all.',
    audienceScope: 'platform',
    status: 'registration_open',
    registrationOpensAt: daysAgo(7),
    registrationClosesAt: daysFrom(3),
    startsAt: daysFrom(5),
    endsAt: daysFrom(5.125),
    capacity: 500,
    registrationCount: 287,
    config: {
      problems: mockProblems.slice(0, 5).map((p, i) => ({ problemId: p.id, points: (i + 1) * 100, order: i + 1, title: p.title, difficulty: p.difficulty, slug: p.slug })),
      scoring: { type: 'icpc', wrongAttemptPenaltyMinutes: 20 },
      leaderboardVisibleDuringEvent: true,
      allowedLanguages: ['python', 'java', 'cpp', 'c'],
    },
    tenantId: null,
    createdByUserId: 'user-platform-admin-001',
    createdAt: daysAgo(14),
    myRegistration: { id: 'reg-student-001', eventId: 'event-001', userId: 'user-student-001', status: 'registered', registeredAt: daysAgo(3), createdAt: daysAgo(3) },
  },
  {
    id: 'event-002',
    kind: 'workshop',
    title: 'Web Development Masterclass',
    description: 'A full-day workshop on modern web development with React 19, Next.js, and Tailwind CSS.',
    audienceScope: 'tenant',
    status: 'completed',
    registrationOpensAt: daysAgo(30),
    registrationClosesAt: daysAgo(8),
    startsAt: daysAgo(7),
    endsAt: daysAgo(6.75),
    capacity: 100,
    registrationCount: 100,
    config: {
      speakers: [
        { name: 'Priya Krishnamurthy', title: 'Head of Engineering', bio: '10+ years in web development' },
        { name: 'Arjun Sharma', title: 'Frontend Architect', bio: 'React core contributor' },
      ],
      agenda: [
        { time: '09:00', title: 'Introduction to React 19', speakerName: 'Arjun Sharma' },
        { time: '11:00', title: 'Next.js App Router Deep Dive', speakerName: 'Priya Krishnamurthy' },
        { time: '14:00', title: 'Tailwind CSS & Component Libraries', speakerName: 'Arjun Sharma' },
        { time: '16:00', title: 'Q&A and Project Showcase' },
      ],
      materials: [{ title: 'Workshop Slides', url: '#' }, { title: 'GitHub Repository', url: '#' }],
    },
    tenantId: 'tenant-college-iitm-001',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(45),
    myRegistration: { id: 'reg-student-002', eventId: 'event-002', userId: 'user-student-001', status: 'registered', registeredAt: daysAgo(20), createdAt: daysAgo(20) },
  },
  {
    id: 'event-003',
    kind: 'competition',
    title: 'IIT Madras Hackathon 2026',
    description: 'Build innovative solutions in 24 hours. Themes: AI, Sustainability, FinTech.',
    audienceScope: 'tenant',
    status: 'live',
    registrationOpensAt: daysAgo(20),
    registrationClosesAt: daysAgo(2),
    startsAt: daysAgo(0.5),
    endsAt: daysFrom(0.5),
    capacity: 200,
    registrationCount: 198,
    config: {
      problems: mockProblems.slice(5, 8).map((p, i) => ({ problemId: p.id, points: (i + 1) * 200, order: i + 1, title: p.title, difficulty: p.difficulty, slug: p.slug })),
      scoring: { type: 'weighted' },
      leaderboardVisibleDuringEvent: true,
      allowedLanguages: ['python', 'java', 'cpp', 'javascript'],
    },
    tenantId: 'tenant-college-iitm-001',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(30),
    myRegistration: null,
  },
  {
    id: 'event-004',
    kind: 'workshop',
    title: 'Machine Learning for Beginners',
    description: 'Introduction to ML concepts, tools, and building your first model.',
    audienceScope: 'tenant',
    status: 'published',
    registrationOpensAt: daysFrom(1),
    registrationClosesAt: daysFrom(14),
    startsAt: daysFrom(15),
    endsAt: daysFrom(15.25),
    capacity: 80,
    registrationCount: 12,
    config: {
      speakers: [{ name: 'Dr. Ramesh Babu', title: 'AI Research Lead', bio: 'PhD from IIT Bombay, 8 years in ML' }],
      agenda: [
        { time: '10:00', title: 'What is Machine Learning?', speakerName: 'Dr. Ramesh Babu' },
        { time: '11:30', title: 'Python for ML: NumPy & Pandas', speakerName: 'Dr. Ramesh Babu' },
        { time: '14:00', title: 'Building Your First ML Model', speakerName: 'Dr. Ramesh Babu' },
      ],
    },
    tenantId: 'tenant-college-iitm-001',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(7),
    myRegistration: null,
  },
  {
    id: 'event-005',
    kind: 'competition',
    title: 'Algo Arena Monthly — June',
    description: 'Monthly competitive programming contest. 5 problems in 3 hours.',
    audienceScope: 'platform',
    status: 'completed',
    registrationOpensAt: daysAgo(21),
    registrationClosesAt: daysAgo(8),
    startsAt: daysAgo(7),
    endsAt: daysAgo(6.875),
    capacity: null,
    registrationCount: 1024,
    config: {
      problems: mockProblems.slice(10, 15).map((p, i) => ({ problemId: p.id, points: (i + 1) * 100, order: i + 1, title: p.title, difficulty: p.difficulty, slug: p.slug })),
      scoring: { type: 'icpc', wrongAttemptPenaltyMinutes: 20 },
      leaderboardVisibleDuringEvent: false,
      allowedLanguages: ['python', 'java', 'cpp', 'c', 'javascript'],
    },
    tenantId: null,
    createdByUserId: 'user-platform-admin-001',
    createdAt: daysAgo(30),
    myRegistration: { id: 'reg-student-003', eventId: 'event-005', userId: 'user-student-001', status: 'registered', registeredAt: daysAgo(14), createdAt: daysAgo(14) },
  },
]

export const mockRegistrations: Registration[] = [
  ...Array.from({ length: 50 }, (_, i) => ({
    id: uid('reg', i + 10),
    eventId: 'event-001',
    userId: uid('user-s', i + 1),
    status: 'registered' as const,
    source: 'tenant' as const,
    registeredAt: daysAgo(i * 0.2 + 1),
    createdAt: daysAgo(i * 0.2 + 1),
  })),
]

// ─── Event Leaderboard ────────────────────────────────────────────────────────

const DISPLAY_NAMES = [
  'kavya_r', 'arjun_s', 'priya_k', 'rohit_m', 'ananya_v', 'vikram_c',
  'sindhu_n', 'karthik_p', 'meera_l', 'suresh_b', 'deepa_r', 'rajesh_k',
  'nithya_s', 'arun_p', 'divya_m', 'vivek_c', 'lakshmi_v', 'balaji_k',
  'sanjay_g', 'preethi_s',
]

export const mockLeaderboard: LeaderboardEntry[] = DISPLAY_NAMES.map((name, i) => ({
  rank: i + 1,
  userId: i === 0 ? 'user-student-001' : uid('user-s', i + 1),
  displayName: name,
  acceptedCount: Math.max(0, 5 - Math.floor(i / 4)),
  totalTime: 60 + i * 12,
  wrongAttempts: { [mockProblems[0].id]: i % 2, [mockProblems[1].id]: i % 3 },
  score: Math.max(0, 1500 - i * 75),
  isCurrentUser: i === 0,
}))

// ─── Global Leaderboard ───────────────────────────────────────────────────────

export const mockGlobalLeaderboard = {
  entries: DISPLAY_NAMES.map((name, i) => ({
    rank: i + 1,
    personId: i === 0 ? 'person-student-001' : uid('person-s', i + 1),
    displayName: name,
    rating: 3200 - i * 140,
    eventsParticipated: 12 - Math.floor(i / 2),
  })),
  total: 18430,
  updatedAt: daysAgo(0.04),
}

// ─── Certificates ─────────────────────────────────────────────────────────────

const ACHIEVEMENT_TITLES = [
  'Data Structures & Algorithms', 'Web Development Masterclass',
  'Machine Learning Fundamentals', 'IIT Madras Hackathon 2026 — Participant',
  'Dezolver Code Sprint 2025 — Top 50', 'Python Programming Basics',
  'Advanced Graph Algorithms', 'Full Stack Development',
]

export const mockCertificates: Certificate[] = ACHIEVEMENT_TITLES.map((title, i) => ({
  id: uid('cert', i + 1),
  certificateId: `DZL-2026-${String(Math.floor(Math.random() * 99999999)).padStart(8, '0')}`,
  recipientUserId: 'user-student-001',
  recipientName: 'Kavya Reddy',
  status: 'issued',
  isPublic: i % 2 === 0,
  achievementKind: i < 4 ? 'path' : i < 6 ? 'event' : 'room',
  achievementTitle: title,
  templateId: 'tmpl-001',
  templateName: 'Standard Certificate',
  issuedAt: daysAgo(10 + i * 7),
  tenantId: 'tenant-college-iitm-001',
  createdAt: daysAgo(10 + i * 7),
}))

export const mockAllCertificates: Certificate[] = [
  ...mockCertificates,
  ...Array.from({ length: 40 }, (_, i) => ({
    id: uid('cert-admin', i + 1),
    certificateId: `DZL-2026-${String(10000000 + i * 7).padStart(8, '0')}`,
    recipientUserId: uid('user-s', i + 1),
    recipientName: DISPLAY_NAMES[i % DISPLAY_NAMES.length].replace('_', ' '),
    status: 'issued' as const,
    isPublic: i % 3 !== 0,
    achievementKind: (i % 3 === 0 ? 'path' : i % 3 === 1 ? 'event' : 'room') as Certificate['achievementKind'],
    achievementTitle: ACHIEVEMENT_TITLES[i % ACHIEVEMENT_TITLES.length],
    templateId: 'tmpl-001',
    templateName: 'Standard Certificate',
    issuedAt: daysAgo(i * 2),
    tenantId: 'tenant-college-iitm-001',
    createdAt: daysAgo(i * 2),
  })),
]

export const mockCertificateTemplates: CertificateTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Standard Achievement Certificate',
    description: 'Default certificate template for all achievements.',
    bodyHtml: `<div class="certificate"><h1>Certificate of Achievement</h1><p>This certifies that <strong>{{recipientName}}</strong> has successfully completed <strong>{{achievementTitle}}</strong> on {{issuedAt}}.</p><p>Certificate ID: {{certificateId}}</p><p>Issued by: {{issuerName}}</p></div>`,
    bodyCss: `.certificate { font-family: 'Georgia', serif; text-align: center; padding: 60px; border: 8px double #1d4ed8; }`,
    status: 'published',
    pageOrientation: 'landscape',
    pageSize: 'A4',
    defaultVariables: { signatoryName: 'Arjun Sharma', signatoryTitle: 'CEO, Dezolver' },
    tenantId: null,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
  },
  {
    id: 'tmpl-002',
    name: 'Competition Winner Certificate',
    description: 'For competition top performers.',
    bodyHtml: `<div class="cert-winner"><h1>🏆 Winner's Certificate</h1><p>Awarded to <strong>{{recipientName}}</strong> for outstanding performance in <strong>{{achievementTitle}}</strong>.</p></div>`,
    bodyCss: `.cert-winner { background: linear-gradient(135deg, #ffd700, #ff8c00); padding: 80px; text-align: center; }`,
    status: 'published',
    pageOrientation: 'landscape',
    pageSize: 'A4',
    defaultVariables: {},
    tenantId: null,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
  {
    id: 'tmpl-003',
    name: 'Workshop Participation',
    description: 'For workshop attendees.',
    bodyHtml: `<div class="cert-workshop"><h2>Certificate of Participation</h2><p>This is to certify that {{recipientName}} participated in {{achievementTitle}}.</p></div>`,
    bodyCss: `.cert-workshop { border: 4px solid #10b981; padding: 60px; font-family: sans-serif; }`,
    status: 'draft',
    pageOrientation: 'landscape',
    pageSize: 'A4',
    defaultVariables: {},
    tenantId: 'tenant-college-iitm-001',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  },
]

export const mockIssuanceRules: IssuanceRule[] = [
  { id: 'rule-001', name: 'Path Completion Certificate', triggerEventType: 'PathCompleted', templateId: 'tmpl-001', templateName: 'Standard Achievement Certificate', isActive: true, tenantId: null, createdAt: daysAgo(60) },
  { id: 'rule-002', name: 'Event Participation Certificate', triggerEventType: 'EventCompleted', templateId: 'tmpl-002', templateName: 'Competition Winner Certificate', isActive: true, tenantId: null, createdAt: daysAgo(45) },
  { id: 'rule-003', name: 'Room Completion', triggerEventType: 'RoomCompleted', templateId: 'tmpl-003', templateName: 'Workshop Participation', isActive: false, tenantId: 'tenant-college-iitm-001', createdAt: daysAgo(20) },
]

// ─── Learning Paths ───────────────────────────────────────────────────────────

export const mockPaths: Path[] = [
  {
    id: 'path-frontend-001',
    kind: 'default',
    status: 'published',
    title: 'Frontend Development Path',
    description: 'Master modern frontend development with React, TypeScript, and CSS frameworks.',
    outcomeStatement: 'Build production-ready web applications with industry best practices.',
    domainCode: 'it',
    estimatedMinutes: 1200,
    stepCount: 8,
    steps: mockRooms.slice(7, 15).map((r, i) => ({
      id: uid('step-fe', i + 1),
      pathId: 'path-frontend-001',
      roomId: r.id,
      orderIndex: i,
      isOptional: i > 5,
      prerequisiteStepIds: i > 0 ? [uid('step-fe', i)] : [],
      room: { id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, domainCodes: r.domainCodes },
      progress: i < 3 ? 'completed' : i === 3 ? 'in_progress' : 'not_started',
      unlocked: i <= 4,
      prerequisitesMet: i <= 4,
    })),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
    myProgress: { pathId: 'path-frontend-001', userId: 'user-student-001', percentageComplete: 37, stepsCompleted: 3, stepsTotal: 8, lastActivityAt: daysAgo(1), completedAt: null, isCompleted: false },
  },
  {
    id: 'path-dsa-001',
    kind: 'default',
    status: 'published',
    title: 'DSA Mastery Path',
    description: 'From arrays to advanced graph algorithms. Prepare for technical interviews.',
    outcomeStatement: 'Confidently solve medium-hard problems on LeetCode and Codeforces.',
    domainCode: 'cse',
    estimatedMinutes: 1800,
    stepCount: 12,
    steps: mockRooms.slice(0, 12).map((r, i) => ({
      id: uid('step-dsa', i + 1),
      pathId: 'path-dsa-001',
      roomId: r.id,
      orderIndex: i,
      isOptional: false,
      prerequisiteStepIds: i > 0 ? [uid('step-dsa', i)] : [],
      room: { id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, domainCodes: r.domainCodes },
      progress: i < 5 ? 'completed' : i === 5 ? 'in_progress' : 'not_started',
      unlocked: i <= 6,
      prerequisitesMet: i <= 6,
    })),
    createdAt: daysAgo(120),
    updatedAt: daysAgo(3),
    myProgress: { pathId: 'path-dsa-001', userId: 'user-student-001', percentageComplete: 42, stepsCompleted: 5, stepsTotal: 12, lastActivityAt: daysAgo(0.5), completedAt: null, isCompleted: false },
  },
  {
    id: 'path-ml-001',
    kind: 'default',
    status: 'published',
    title: 'AI/ML Engineering Path',
    description: 'Build ML models from scratch. Covers Python, statistics, and deep learning.',
    outcomeStatement: 'Deploy ML models to production using industry tools.',
    domainCode: 'aiml',
    estimatedMinutes: 2400,
    stepCount: 10,
    steps: mockRooms.slice(10, 20).map((r, i) => ({
      id: uid('step-ml', i + 1),
      pathId: 'path-ml-001',
      roomId: r.id,
      orderIndex: i,
      isOptional: i > 7,
      prerequisiteStepIds: i > 0 ? [uid('step-ml', i)] : [],
      room: { id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, domainCodes: r.domainCodes },
      progress: 'not_started',
      unlocked: i === 0,
      prerequisitesMet: i === 0,
    })),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(7),
    myProgress: { pathId: 'path-ml-001', userId: 'user-student-001', percentageComplete: 0, stepsCompleted: 0, stepsTotal: 10, lastActivityAt: null, completedAt: null, isCompleted: false },
  },
  {
    id: 'path-backend-001',
    kind: 'curated',
    status: 'published',
    title: 'Backend Development Path',
    description: 'Build robust server-side applications with Node.js, databases, and APIs.',
    outcomeStatement: 'Design and deploy scalable backend services.',
    domainCode: 'it',
    estimatedMinutes: 1500,
    stepCount: 7,
    steps: mockRooms.slice(8, 15).map((r, i) => ({
      id: uid('step-be', i + 1),
      pathId: 'path-backend-001',
      roomId: r.id,
      orderIndex: i,
      isOptional: false,
      prerequisiteStepIds: i > 0 ? [uid('step-be', i)] : [],
      room: { id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, domainCodes: r.domainCodes },
      progress: i === 0 ? 'completed' : 'not_started',
      unlocked: i <= 1,
      prerequisitesMet: i <= 1,
    })),
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
    myProgress: { pathId: 'path-backend-001', userId: 'user-student-001', percentageComplete: 14, stepsCompleted: 1, stepsTotal: 7, lastActivityAt: daysAgo(3), completedAt: null, isCompleted: false },
  },
  {
    id: 'path-cp-001',
    kind: 'default',
    status: 'published',
    title: 'Competitive Programming Path',
    description: 'Elite training for ICPC, CodeChef and Codeforces. Advanced algorithms and speed.',
    outcomeStatement: 'Reach Specialist+ on Codeforces and place in ICPC regionals.',
    domainCode: 'cse',
    estimatedMinutes: 3000,
    stepCount: 15,
    steps: mockRooms.slice(0, 15).map((r, i) => ({
      id: uid('step-cp', i + 1),
      pathId: 'path-cp-001',
      roomId: r.id,
      orderIndex: i,
      isOptional: i > 10,
      prerequisiteStepIds: i > 0 ? [uid('step-cp', i)] : [],
      room: { id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes ?? null, domainCodes: r.domainCodes },
      progress: i < 2 ? 'completed' : 'not_started',
      unlocked: i <= 2,
      prerequisitesMet: i <= 2,
    })),
    createdAt: daysAgo(100),
    updatedAt: daysAgo(10),
    myProgress: { pathId: 'path-cp-001', userId: 'user-student-001', percentageComplete: 13, stepsCompleted: 2, stepsTotal: 15, lastActivityAt: daysAgo(5), completedAt: null, isCompleted: false },
  },
]

// ─── Career Maps ──────────────────────────────────────────────────────────────

export const mockCareerMaps: CareerMap[] = [
  {
    id: 'cm-fullstack-001',
    title: 'Full Stack Developer',
    description: 'End-to-end career map to become a production-ready full stack engineer.',
    domainCode: 'it',
    outcomeStatement: 'Build and deploy full stack applications independently.',
    paths: [
      { id: mockPaths[0].id, title: mockPaths[0].title, kind: 'default', estimatedMinutes: 1200, stepCount: 8 },
      { id: mockPaths[3].id, title: mockPaths[3].title, kind: 'curated', estimatedMinutes: 1500, stepCount: 7 },
    ],
    createdAt: daysAgo(90),
  },
  {
    id: 'cm-dsa-001',
    title: 'Algorithm Expert',
    description: 'Comprehensive path to mastering algorithms and competitive programming.',
    domainCode: 'cse',
    outcomeStatement: 'Excel in technical interviews and competitive programming.',
    paths: [
      { id: mockPaths[1].id, title: mockPaths[1].title, kind: 'default', estimatedMinutes: 1800, stepCount: 12 },
      { id: mockPaths[4].id, title: mockPaths[4].title, kind: 'default', estimatedMinutes: 3000, stepCount: 15 },
    ],
    createdAt: daysAgo(120),
  },
  {
    id: 'cm-ml-001',
    title: 'AI/ML Engineer',
    description: 'From ML theory to deploying models in production.',
    domainCode: 'aiml',
    outcomeStatement: 'Design and deploy ML systems at scale.',
    paths: [
      { id: mockPaths[2].id, title: mockPaths[2].title, kind: 'default', estimatedMinutes: 2400, stepCount: 10 },
    ],
    createdAt: daysAgo(60),
  },
]

// ─── Billing ──────────────────────────────────────────────────────────────────

export const mockPlans: Plan[] = [
  {
    id: 'plan-starter',
    code: 'starter',
    name: 'Starter',
    description: 'Perfect for small institutions getting started with online assessments.',
    appliesTo: 'college',
    pricing: { monthly: 4999, annual: 49999, currency: 'INR' },
    features: { maxStudents: 200, maxFaculty: 10, maxCohorts: 2, events_competitions: false, assessments: true, certificates: false, analytics: false, sso: false, paths: true, curriculum: true, support: 'email' },
    isActive: true,
    sortOrder: 1,
    createdAt: daysAgo(365),
  },
  {
    id: 'plan-professional',
    code: 'professional',
    name: 'Professional',
    description: 'Full-featured platform for growing engineering colleges.',
    appliesTo: 'college',
    pricing: { monthly: 14999, annual: 149999, currency: 'INR' },
    features: { maxStudents: 2000, maxFaculty: 100, maxCohorts: 20, events_competitions: true, assessments: true, certificates: true, analytics: true, sso: false, paths: true, curriculum: true, support: 'priority' },
    isActive: true,
    sortOrder: 2,
    createdAt: daysAgo(365),
  },
  {
    id: 'plan-enterprise',
    code: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited scale with SSO, dedicated support, and custom branding.',
    appliesTo: 'college',
    pricing: { monthly: 39999, annual: 399999, currency: 'INR' },
    features: { maxStudents: null, maxFaculty: null, maxCohorts: null, events_competitions: true, assessments: true, certificates: true, analytics: true, sso: true, paths: true, curriculum: true, support: 'dedicated' },
    isActive: true,
    sortOrder: 3,
    createdAt: daysAgo(365),
  },
]

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-iitm-001',
    tenantId: 'tenant-college-iitm-001',
    userId: null,
    planCode: 'professional',
    planName: 'Professional',
    status: 'active',
    billingCycle: 'annual',
    currentPeriodStart: daysAgo(90),
    currentPeriodEnd: daysFrom(275),
    trialEndsAt: null,
    amountInr: 149999,
    createdAt: daysAgo(90),
    razorpaySubscriptionId: 'sub_RzrPay12345678',
  },
  {
    id: 'sub-student-001',
    tenantId: null,
    userId: 'user-student-001',
    planCode: 'professional',
    planName: 'Professional',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: daysAgo(15),
    currentPeriodEnd: daysFrom(15),
    trialEndsAt: null,
    amountInr: 14999,
    createdAt: daysAgo(45),
  },
]

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001', invoiceNumber: 'DZL-INV-2026-0001', subscriptionId: 'sub-iitm-001',
    tenantId: 'tenant-college-iitm-001', status: 'paid', amountInr: 149999, taxAmountInr: 26999, totalAmountInr: 176998,
    billingPeriodStart: daysAgo(90), billingPeriodEnd: daysFrom(275), issuedAt: daysAgo(90), paidAt: daysAgo(89), dueAt: daysAgo(80),
    lineItems: [{ description: 'Professional Plan — Annual', quantity: 1, unitAmountInr: 149999, totalAmountInr: 149999, gstRate: 18 }],
    createdAt: daysAgo(90),
  },
  {
    id: 'inv-002', invoiceNumber: 'DZL-INV-2026-0002', subscriptionId: 'sub-student-001',
    tenantId: null, status: 'paid', amountInr: 14999, taxAmountInr: 2699, totalAmountInr: 17698,
    billingPeriodStart: daysAgo(30), billingPeriodEnd: daysAgo(1), issuedAt: daysAgo(30), paidAt: daysAgo(30), dueAt: daysAgo(20),
    lineItems: [{ description: 'Professional Plan — Monthly', quantity: 1, unitAmountInr: 14999, totalAmountInr: 14999, gstRate: 18 }],
    createdAt: daysAgo(30),
  },
  {
    id: 'inv-003', invoiceNumber: 'DZL-INV-2026-0003', subscriptionId: 'sub-student-001',
    tenantId: null, status: 'issued', amountInr: 14999, taxAmountInr: 2699, totalAmountInr: 17698,
    billingPeriodStart: daysAgo(1), billingPeriodEnd: daysFrom(29), issuedAt: daysAgo(1), paidAt: null, dueAt: daysFrom(14),
    lineItems: [{ description: 'Professional Plan — Monthly', quantity: 1, unitAmountInr: 14999, totalAmountInr: 14999, gstRate: 18 }],
    createdAt: daysAgo(1),
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: uid('inv', i + 10),
    invoiceNumber: `DZL-INV-2025-${String(i + 1).padStart(4, '0')}`,
    subscriptionId: 'sub-iitm-001',
    tenantId: 'tenant-college-iitm-001',
    status: 'paid' as const,
    amountInr: 14999 + i * 5000,
    taxAmountInr: Math.round((14999 + i * 5000) * 0.18),
    totalAmountInr: Math.round((14999 + i * 5000) * 1.18),
    billingPeriodStart: daysAgo(90 + i * 30),
    billingPeriodEnd: daysAgo(60 + i * 30),
    issuedAt: daysAgo(90 + i * 30),
    paidAt: daysAgo(89 + i * 30),
    dueAt: daysAgo(80 + i * 30),
    createdAt: daysAgo(90 + i * 30),
  })),
]

export const mockPayments: Payment[] = [
  { id: 'pay-001', invoiceId: 'inv-001', subscriptionId: 'sub-iitm-001', tenantId: 'tenant-college-iitm-001', amountInr: 176998, status: 'captured', method: 'netbanking', razorpayPaymentId: 'pay_RzrPayABC123', createdAt: daysAgo(89), capturedAt: daysAgo(89) },
  { id: 'pay-002', invoiceId: 'inv-002', subscriptionId: 'sub-student-001', tenantId: null, amountInr: 17698, status: 'captured', method: 'upi', razorpayPaymentId: 'pay_RzrPayDEF456', createdAt: daysAgo(30), capturedAt: daysAgo(30) },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: uid('pay', i + 10),
    invoiceId: uid('inv', i + 10),
    subscriptionId: 'sub-iitm-001',
    tenantId: 'tenant-college-iitm-001',
    amountInr: Math.round((14999 + i * 5000) * 1.18),
    status: 'captured' as const,
    method: ['upi', 'netbanking', 'card'][i % 3] as Payment['method'],
    razorpayPaymentId: `pay_${uid('rzr', i + 10)}`,
    createdAt: daysAgo(89 + i * 30),
    capturedAt: daysAgo(89 + i * 30),
  })),
]

export const mockPayouts: CollegePayout[] = mockTenants.slice(1, 11).map((t, i) => ({
  id: uid('payout', i + 1),
  tenantId: t.id,
  tenantName: t.name,
  periodMonth: `2026-0${(i % 6) + 1}`,
  grossInr: 50000 + i * 25000,
  platformFeeInr: 5000 + i * 2500,
  refundedInr: i % 3 === 0 ? 1000 : 0,
  netInr: 45000 + i * 22500 - (i % 3 === 0 ? 1000 : 0),
  status: i < 6 ? 'completed' : i < 8 ? 'processing' : 'pending',
  createdAt: daysAgo(30 - i * 3),
  completedAt: i < 6 ? daysAgo(28 - i * 3) : null,
}))

// ─── Curriculum ───────────────────────────────────────────────────────────────

export const mockDomains: Domain[] = [
  { id: 'dom-cse', tenantId: 'tenant-college-iitm-001', name: 'Computer Science', code: 'cse', description: 'Core CS subjects', createdAt: daysAgo(120) },
  { id: 'dom-ece', tenantId: 'tenant-college-iitm-001', name: 'Electronics', code: 'ece', description: 'Electronics and communication', createdAt: daysAgo(120) },
  { id: 'dom-aiml', tenantId: 'tenant-college-iitm-001', name: 'AI & Machine Learning', code: 'aiml', description: 'Artificial Intelligence curriculum', createdAt: daysAgo(90) },
  { id: 'dom-it', tenantId: 'tenant-college-iitm-001', name: 'Information Technology', code: 'it', description: 'Web and software development', createdAt: daysAgo(120) },
]

export const mockSyllabi: Syllabus[] = [
  {
    id: 'syl-cse-001',
    tenantId: 'tenant-college-iitm-001',
    title: 'CSE 3rd Semester Syllabus',
    description: 'Data Structures, Algorithms, and Computer Organization',
    status: 'published',
    createdByUserId: 'user-college-admin-001',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
    nodes: [
      { id: 'node-1', syllabusId: 'syl-cse-001', parentId: null, title: 'Unit 1: Fundamentals', kind: 'topic', contentRef: null, position: 0, metadata: {}, children: [
        { id: 'node-1-1', syllabusId: 'syl-cse-001', parentId: 'node-1', title: 'Arrays and Strings', kind: 'room', contentRef: mockRooms[0].slug, position: 0, metadata: {} },
        { id: 'node-1-2', syllabusId: 'syl-cse-001', parentId: 'node-1', title: 'Linked Lists', kind: 'room', contentRef: mockRooms[1].slug, position: 1, metadata: {} },
      ]},
      { id: 'node-2', syllabusId: 'syl-cse-001', parentId: null, title: 'Unit 2: Advanced Algorithms', kind: 'topic', contentRef: null, position: 1, metadata: {}, children: [
        { id: 'node-2-1', syllabusId: 'syl-cse-001', parentId: 'node-2', title: 'Binary Search', kind: 'room', contentRef: mockRooms[2].slug, position: 0, metadata: {} },
        { id: 'node-2-2', syllabusId: 'syl-cse-001', parentId: 'node-2', title: 'Dynamic Programming', kind: 'room', contentRef: mockRooms[3].slug, position: 1, metadata: {} },
        { id: 'node-2-3', syllabusId: 'syl-cse-001', parentId: 'node-2', title: 'Mid-Semester Assessment', kind: 'assessment', contentRef: 'assess-coding-001', position: 2, metadata: {} },
      ]},
    ],
  },
  {
    id: 'syl-aiml-001',
    tenantId: 'tenant-college-iitm-001',
    title: 'AI/ML Elective Syllabus',
    description: 'Machine Learning fundamentals to advanced neural networks',
    status: 'draft',
    createdByUserId: 'user-faculty-001',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(2),
    nodes: [
      { id: 'node-ml-1', syllabusId: 'syl-aiml-001', parentId: null, title: 'Module 1: Python for ML', kind: 'topic', contentRef: null, position: 0, metadata: {} },
      { id: 'node-ml-2', syllabusId: 'syl-aiml-001', parentId: null, title: 'Module 2: Algorithms', kind: 'topic', contentRef: null, position: 1, metadata: {} },
    ],
  },
]

export const mockOverlays: SyllabusOverlay[] = [
  {
    id: 'overlay-001',
    syllabusId: 'syl-cse-001',
    cohortId: 'cohort-cse-2025',
    nodeId: 'node-2-3',
    dueDate: daysFrom(30),
    visible: true,
    status: 'active',
    createdAt: daysAgo(15),
    operations: [
      { id: 'op-001', overlayId: 'overlay-001', sequence: 1, operationType: 'rename_node', targetNodeId: 'node-2-3', payload: { newTitle: 'Mid-Semester: DSA Exam' }, createdAt: daysAgo(15) },
    ],
  },
]

// ─── Audit Entries ────────────────────────────────────────────────────────────

const AUDIT_ACTIONS = [
  'tenant.created', 'tenant.status_changed', 'user.invited', 'user.role_changed',
  'assessment.published', 'event.created', 'event.started', 'certificate.issued',
  'feature_flag.toggled', 'subscription.created', 'subscription.upgraded',
  'billing.payment_captured', 'user.login', 'user.logout',
]

export const mockAuditEntries: AuditEntry[] = Array.from({ length: 100 }, (_, i) => ({
  id: uid('audit', i + 1),
  action: AUDIT_ACTIONS[i % AUDIT_ACTIONS.length],
  actorId: i % 3 === 0 ? 'user-platform-admin-001' : i % 3 === 1 ? 'user-college-admin-001' : 'user-faculty-001',
  actorEmail: i % 3 === 0 ? 'admin@dezolver.com' : i % 3 === 1 ? 'college@dezolver.com' : 'faculty@dezolver.com',
  targetId: uid('target', i + 1),
  targetType: ['tenant', 'user', 'assessment', 'event', 'certificate'][i % 5],
  tenantId: i % 4 === 0 ? null : 'tenant-college-iitm-001',
  metadata: { ip: `192.168.${i % 10}.${i % 255}`, userAgent: 'Mozilla/5.0' },
  ipAddress: `192.168.${i % 10}.${i % 255}`,
  createdAt: daysAgo(i * 0.1),
}))

// ─── Feature Flags ────────────────────────────────────────────────────────────

export const mockFeatureFlags: FeatureFlag[] = [
  { key: 'sso_v1', name: 'SSO Integration (SAML)', enabled: true, description: 'Enable SSO via SAML 2.0 for enterprise tenants', scope: 'global', updatedAt: daysAgo(7) },
  { key: 'ai_hints', name: 'AI Code Hints', enabled: false, description: 'Show AI-powered hints during coding assessments', scope: 'global', updatedAt: daysAgo(14) },
  { key: 'video_rooms', name: 'Video Learning Rooms', enabled: true, description: 'Allow embedding video content in rooms', scope: 'global', updatedAt: daysAgo(30) },
  { key: 'advanced_analytics', name: 'Advanced Analytics Dashboard', enabled: true, description: 'Detailed cohort and engagement analytics', scope: 'global', updatedAt: daysAgo(45) },
  { key: 'peer_review', name: 'Peer Code Review', enabled: false, description: 'Enable peer-to-peer code review for submissions', scope: 'global', updatedAt: daysAgo(60) },
  { key: 'bulk_invite', name: 'Bulk CSV Invitations', enabled: true, description: 'Upload CSV to send bulk invitations', scope: 'global', updatedAt: daysAgo(90) },
  { key: 'razorpay_upi', name: 'Razorpay UPI', enabled: true, description: 'Accept UPI payments via Razorpay', scope: 'global', updatedAt: daysAgo(90) },
  { key: 'proctoring_v2', name: 'Enhanced Proctoring v2', enabled: false, description: 'Advanced anti-cheat with face detection', scope: 'global', updatedAt: daysAgo(3) },
  { key: 'global_leaderboard', name: 'Global Leaderboard', enabled: true, description: 'Platform-wide competitive ranking', scope: 'global', updatedAt: daysAgo(120) },
  { key: 'career_maps', name: 'Career Maps', enabled: true, description: 'Structured multi-path career roadmaps', scope: 'global', updatedAt: daysAgo(30) },
  { key: 'certificate_pdf_v2', name: 'Certificate PDF v2', enabled: true, description: 'New PDF generation with QR codes', scope: 'global', updatedAt: daysAgo(7) },
  { key: 'webhook_integrations', name: 'Webhook Integrations', enabled: false, description: 'Allow tenants to configure webhooks', scope: 'global', updatedAt: daysAgo(14) },
]

// ─── Media Assets ─────────────────────────────────────────────────────────────

export const mockMediaAssets: MediaAsset[] = Array.from({ length: 20 }, (_, i) => ({
  id: uid('media', i + 1),
  kind: ['image', 'video', 'document', 'image'][i % 4] as MediaAsset['kind'],
  filename: `asset-${i + 1}.${['png', 'mp4', 'pdf', 'jpg'][i % 4]}`,
  mimeType: ['image/png', 'video/mp4', 'application/pdf', 'image/jpeg'][i % 4],
  sizeBytes: (i + 1) * 512000,
  status: 'ready',
  cdnUrl: `https://cdn.dezolver.com/assets/${uid('media', i + 1)}`,
  width: i % 4 !== 2 ? 1920 : null,
  height: i % 4 !== 2 ? 1080 : null,
  durationSeconds: i % 4 === 1 ? 300 + i * 60 : null,
  uploadedByUserId: 'user-platform-admin-001',
  createdAt: daysAgo(30 - i),
}))

// ─── Platform Status ──────────────────────────────────────────────────────────

export const mockLaunchStatus = {
  currentPhase: 'beta' as const,
  nextPhase: 'limited_ga' as const,
  advancedAt: daysAgo(30),
  advancedBy: 'user-platform-admin-001',
  notes: 'All core features stable, moving to limited GA next quarter.',
}

export const mockSystemHealth = {
  status: 'healthy',
  container: 'dezolver-api-v2',
  version: '2.4.1',
  gitSha: 'abc123def456',
  checks: {
    database: { status: 'up', latencyMs: 12 },
    redis: { status: 'up', latencyMs: 3 },
    storage: { status: 'up', latencyMs: 45 },
    judge: { status: 'up', latencyMs: 89 },
    email: { status: 'up', latencyMs: 120 },
  },
}

export const mockPlatformVersion = {
  version: '2.4.1',
  releaseDate: daysAgo(7),
  gitSha: 'abc123def456',
  environment: 'production',
}

// ─── Room Progress ────────────────────────────────────────────────────────────

export const mockRoomProgress = new Map<string, { state: string; startedAt: string | null; completedAt: string | null }>(
  mockRooms.slice(0, 8).map((r, i) => [
    r.id,
    {
      state: i < 5 ? 'completed' : i === 5 ? 'in_progress' : 'not_started',
      startedAt: daysAgo(30 - i),
      completedAt: i < 5 ? daysAgo(29 - i) : null,
    },
  ])
)

// ─── Roles & Permissions ──────────────────────────────────────────────────────

export const mockRoles = [
  { id: 'role-platform-admin', name: 'Platform Admin', description: 'Full platform access', permissions: ['*'] },
  { id: 'role-college-admin', name: 'College Admin', description: 'Full institution admin', permissions: ['tenant.*', 'users.*', 'cohorts.*', 'billing.*'] },
  { id: 'role-faculty', name: 'Faculty', description: 'Create and manage assessments', permissions: ['assessments.*', 'events.*', 'content.read'] },
  { id: 'role-student', name: 'Student', description: 'Learn and participate', permissions: ['content.read', 'assessments.take', 'events.register'] },
  { id: 'role-coordinator', name: 'Coordinator', description: 'Manage cohorts and paths', permissions: ['cohorts.*', 'paths.write', 'curriculum.*'] },
  { id: 'role-content-manager', name: 'Content Manager', description: 'Create platform content', permissions: ['content.*', 'paths.*', 'curriculum.*'] },
]

export const mockPermissions = [
  { id: 'perm-content-read', key: 'content.read', name: 'Read Content', description: 'Access rooms, courses, and problems' },
  { id: 'perm-content-write', key: 'content.write', name: 'Write Content', description: 'Create and edit rooms and courses' },
  { id: 'perm-assessments-take', key: 'assessments.take', name: 'Take Assessments', description: 'Submit solutions to assessments' },
  { id: 'perm-assessments-create', key: 'assessments.create', name: 'Create Assessments', description: 'Author new assessments' },
  { id: 'perm-users-manage', key: 'users.manage', name: 'Manage Users', description: 'Invite, suspend, and manage users' },
  { id: 'perm-billing-view', key: 'billing.view', name: 'View Billing', description: 'View invoices and subscription info' },
]
