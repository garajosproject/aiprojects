export type PatientStatus = 'Active' | 'Onboarding' | 'Plan Expired' | 'In Active'

export interface Patient {
  id: string
  name: string
  age: number
  gender: string
  city: string
  phone: string
  email: string
  status: PatientStatus
  planType: string
  planMonths: number
  planDays: number
  lastActivity: string
  renewalDate: string
  memberSince: string
  currentBMI: number
  currentWeight: number
  startingBMI: number
  startingWeight: number
  height: string
  bodyShape: string
  sugarLevel: string
  bloodPressure: string
  assignedDoctor: string
  assignedCoach: string
  weightHistory: { month: string; weight: number }[]
}

export interface Article {
  id: string
  title: string
  excerpt: string
  status: 'Live' | 'Draft' | 'Unpublished'
  author: string
  publishedDate: string
  lastEdit: string
  category: string
  views: number
  thumbnail: string
}

export type TeamRole = 'Super Admin' | 'Admin' | 'Doctor' | 'Health Coach'
export type TeamStatus = 'Active' | 'In Active' | 'Busy' | 'On leave'

export interface TeamMember {
  id: string
  name: string
  phone: string
  role: TeamRole
  status: TeamStatus
  memberSince: string
  assignedPatients: number | 'NA'
  languages: string[]
  isYou?: boolean
}

export interface SettingsCategory {
  id: string
  name: string
  description: string
  color: string
  createdBy: string
  createdAt: string
}

export const patients: Patient[] = [
  {
    id: '1',
    name: 'Chetan Bhosale',
    age: 28,
    gender: 'Male',
    city: 'Mumbai',
    phone: '9876543210',
    email: 'chetanbhosale@gmail.com',
    status: 'Active',
    planType: 'Yearly Plan',
    planMonths: 11,
    planDays: 3,
    lastActivity: 'Today',
    renewalDate: '13 Dec 2023',
    memberSince: '12 Dec 2022',
    currentBMI: 25.0,
    currentWeight: 80,
    startingBMI: 30.0,
    startingWeight: 98,
    height: "5'8 Inch",
    bodyShape: 'Oval',
    sugarLevel: '99 mg/dL',
    bloodPressure: '120/80 mmHg',
    assignedDoctor: 'Dr. Ankur Gulati',
    assignedCoach: 'Mahesh Patil',
    weightHistory: [
      { month: 'Oct', weight: 80 },
      { month: 'Sep', weight: 82 },
      { month: 'Aug', weight: 86 },
      { month: 'Jul', weight: 89 },
      { month: 'Jun', weight: 93 },
      { month: 'May', weight: 98 },
    ],
  },
  {
    id: '2',
    name: 'Aarvi Saiyyad',
    age: 28,
    gender: 'Female',
    city: 'Mumbai',
    phone: '+91-7024881650',
    email: 'aarvi@gmail.com',
    status: 'Onboarding',
    planType: 'Monthly Plan',
    planMonths: 4,
    planDays: 2,
    lastActivity: 'Today',
    renewalDate: '13 Dec 2022',
    memberSince: '10 Dec 2022',
    currentBMI: 25.0,
    currentWeight: 60,
    startingBMI: 27.0,
    startingWeight: 65,
    height: "5'5 Inch",
    bodyShape: 'Round',
    sugarLevel: '95 mg/dL',
    bloodPressure: '118/76 mmHg',
    assignedDoctor: 'Dr. Ankur Gulati',
    assignedCoach: 'Mahesh Patil',
    weightHistory: [
      { month: 'Oct', weight: 60 },
      { month: 'Sep', weight: 61 },
      { month: 'Aug', weight: 62 },
      { month: 'Jul', weight: 63 },
      { month: 'Jun', weight: 64 },
      { month: 'May', weight: 65 },
    ],
  },
  {
    id: '3',
    name: 'Yugant Hallikeri',
    age: 28,
    gender: 'Male',
    city: 'Mumbai',
    phone: '9876543210',
    email: 'yugant@gmail.com',
    status: 'Active',
    planType: 'Yearly Plan',
    planMonths: 5,
    planDays: 1,
    lastActivity: 'Today',
    renewalDate: '13 Dec 2022',
    memberSince: '5 Jul 2022',
    currentBMI: 25.0,
    currentWeight: 60,
    startingBMI: 28.0,
    startingWeight: 72,
    height: "5'10 Inch",
    bodyShape: 'Athletic',
    sugarLevel: '88 mg/dL',
    bloodPressure: '115/75 mmHg',
    assignedDoctor: 'Dr. Ankur Gulati',
    assignedCoach: 'Mahesh Patil',
    weightHistory: [
      { month: 'Oct', weight: 60 },
      { month: 'Sep', weight: 62 },
      { month: 'Aug', weight: 65 },
      { month: 'Jul', weight: 68 },
      { month: 'Jun', weight: 70 },
      { month: 'May', weight: 72 },
    ],
  },
  {
    id: '4',
    name: 'Kala Salam',
    age: 28,
    gender: 'Male',
    city: 'Mumbai',
    phone: '9876543210',
    email: 'kala@gmail.com',
    status: 'Plan Expired',
    planType: 'Monthly Plan',
    planMonths: 12,
    planDays: 0,
    lastActivity: '3 days ago',
    renewalDate: '10 Aug 2022',
    memberSince: '10 Aug 2021',
    currentBMI: 25.0,
    currentWeight: 60,
    startingBMI: 26.0,
    startingWeight: 63,
    height: "5'7 Inch",
    bodyShape: 'Normal',
    sugarLevel: '92 mg/dL',
    bloodPressure: '122/82 mmHg',
    assignedDoctor: 'Dr. Ankur Gulati',
    assignedCoach: 'Mahesh Patil',
    weightHistory: [
      { month: 'Oct', weight: 60 },
      { month: 'Sep', weight: 60 },
      { month: 'Aug', weight: 61 },
      { month: 'Jul', weight: 62 },
      { month: 'Jun', weight: 62 },
      { month: 'May', weight: 63 },
    ],
  },
  {
    id: '5',
    name: 'Lomi Sachal',
    age: 32,
    gender: 'Female',
    city: 'Pune',
    phone: '9876543211',
    email: 'lomi@gmail.com',
    status: 'Active',
    planType: 'Quarterly Plan',
    planMonths: 2,
    planDays: 5,
    lastActivity: 'Today',
    renewalDate: '20 Jan 2023',
    memberSince: '20 Oct 2022',
    currentBMI: 23.0,
    currentWeight: 55,
    startingBMI: 25.0,
    startingWeight: 60,
    height: "5'4 Inch",
    bodyShape: 'Slim',
    sugarLevel: '85 mg/dL',
    bloodPressure: '110/70 mmHg',
    assignedDoctor: 'Dr. Anchal Gupta',
    assignedCoach: 'Diksha Kumar',
    weightHistory: [
      { month: 'Oct', weight: 55 },
      { month: 'Sep', weight: 56 },
      { month: 'Aug', weight: 57 },
      { month: 'Jul', weight: 58 },
      { month: 'Jun', weight: 59 },
      { month: 'May', weight: 60 },
    ],
  },
]

export const articles: Article[] = [
  {
    id: '1',
    title: 'Best 10 foods to boost metabolism',
    excerpt: 'Certain foods contain specific nutrients that increase the body\'s metabolism...',
    status: 'Live',
    author: 'Anchal Gupta',
    publishedDate: '29 Sep 2022',
    lastEdit: '30 Sep 2022',
    category: 'Food Series',
    views: 23999,
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=80&fit=crop',
  },
  {
    id: '2',
    title: 'Eating Earlier Can Reduce Hunger, Cravings, and Weight Gain',
    excerpt: 'They found that people who ate later in...',
    status: 'Draft',
    author: 'Anchal Gupta',
    publishedDate: '29 Sep 2022',
    lastEdit: '30 Sep 2022',
    category: 'Fact Check',
    views: 23999,
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=120&h=80&fit=crop',
  },
  {
    id: '3',
    title: 'How meal timing affects the body',
    excerpt: 'The study authors write that interventions aimed at obesity often target behaviors...',
    status: 'Live',
    author: 'Anchal Gupta',
    publishedDate: '29 Sep 2022',
    lastEdit: '30 Sep 2022',
    category: 'Evidence Based',
    views: 23999,
    thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=120&h=80&fit=crop',
  },
  {
    id: '4',
    title: 'Tips for healthy meal timing',
    excerpt: 'If you are the type of person who likes to eat most of their food earlier in the day, th...',
    status: 'Live',
    author: 'Anchal Gupta',
    publishedDate: '29 Sep 2022',
    lastEdit: '30 Sep 2022',
    category: 'Nutrition',
    views: 23999,
    thumbnail: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=120&h=80&fit=crop',
  },
  {
    id: '5',
    title: 'Eating These Types of Grains Can Lower Your Heart Disease Risk',
    excerpt: 'Additionally, consuming whole grains...',
    status: 'Unpublished',
    author: 'Anchal Gupta',
    publishedDate: '29 Sep 2022',
    lastEdit: '30 Sep 2022',
    category: 'Expert Advice',
    views: 23999,
    thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&h=80&fit=crop',
  },
]

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'Prashant Shinde', phone: '9876543210', role: 'Super Admin', status: 'Active', memberSince: '12 Sep 2022', assignedPatients: 'NA', languages: ['Hindi', 'English', 'Marathi', 'Gujarati'], isYou: true },
  { id: '2', name: 'Critika Agarwal', phone: '9876543210', role: 'Admin', status: 'Active', memberSince: '12 Sep 2022', assignedPatients: 'NA', languages: ['Hindi', 'English', 'Marathi', 'Gujarati'] },
  { id: '3', name: 'Dinesh Patel', phone: '9876543210', role: 'Admin', status: 'In Active', memberSince: '12 Sep 2022', assignedPatients: 'NA', languages: ['Hindi', 'English', 'Marathi', 'Gujarati'] },
  { id: '4', name: 'Diksha Kumar', phone: '9876543210', role: 'Health Coach', status: 'Active', memberSince: '12 Sep 2022', assignedPatients: 18, languages: ['Hindi', 'English', 'Marathi', 'Gujarati'] },
  { id: '5', name: 'Dr. Anchal Gupta', phone: '9876543210', role: 'Doctor', status: 'Active', memberSince: '12 Sep 2022', assignedPatients: 12, languages: ['Hindi', 'English', 'Marathi', 'Gujarati'] },
  { id: '6', name: 'Sukesh Patel', phone: '9876543210', role: 'Admin', status: 'On leave', memberSince: '12 Sep 2022', assignedPatients: 'NA', languages: ['Hindi', 'English', 'Marathi', 'Gujarati'] },
  { id: '7', name: 'Dr. Divya Goyal', phone: '9876543210', role: 'Doctor', status: 'Busy', memberSince: '12 Sep 2022', assignedPatients: 12, languages: ['Hindi', 'English', 'Marathi', 'Gujarati'] },
  { id: '8', name: 'Mahesh Patil', phone: '9876543210', role: 'Health Coach', status: 'Active', memberSince: '12 Sep 2022', assignedPatients: 15, languages: ['Hindi', 'English', 'Marathi'] },
]

// ── Dashboard analytics data ──────────────────────────────────────────────────

export const monthlyPatientData = [
  { month: 'May', active: 14200, onboarding: 1100, inactive: 980, expired: 620 },
  { month: 'Jun', active: 15800, onboarding: 1340, inactive: 1050, expired: 710 },
  { month: 'Jul', active: 16400, onboarding: 1520, inactive: 1120, expired: 780 },
  { month: 'Aug', active: 17100, onboarding: 1680, inactive: 1240, expired: 820 },
  { month: 'Sep', active: 17600, onboarding: 1820, inactive: 1380, expired: 860 },
  { month: 'Oct', active: 18000, onboarding: 2000, inactive: 1600, expired: 850 },
]

export const patientStatusPie = [
  { name: 'Active', value: 18000, color: '#22c55e' },
  { name: 'Onboarding', value: 2000, color: '#3b82f6' },
  { name: 'In Active', value: 1600, color: '#94a3b8' },
  { name: 'Plan Expired', value: 850, color: '#f87171' },
]

export const bmiMonthlyTrend = [
  { month: 'May', avgBMI: 29.4, avgWeight: 84 },
  { month: 'Jun', avgBMI: 28.8, avgWeight: 82 },
  { month: 'Jul', avgBMI: 28.1, avgWeight: 80 },
  { month: 'Aug', avgBMI: 27.4, avgWeight: 78 },
  { month: 'Sep', avgBMI: 26.6, avgWeight: 76 },
  { month: 'Oct', avgBMI: 25.8, avgWeight: 74 },
]

export const successMetrics = [
  { label: 'Avg BMI Reduction', value: 72, unit: '%', description: 'patients hit target BMI', color: '#22c55e' },
  { label: 'Avg Weight Loss ≥ 5Kg', value: 68, unit: '%', description: 'of active patients', color: '#3b82f6' },
  { label: 'Plan Renewal Rate', value: 81, unit: '%', description: 'renewed after expiry', color: '#8b5cf6' },
  { label: 'Prescription Adherence', value: 64, unit: '%', description: 'consistent medication intake', color: '#f59e0b' },
  { label: 'Goal Completion Rate', value: 57, unit: '%', description: 'routines completed on time', color: '#06b6d4' },
]

export const upcomingTasks = [
  { id: 't1', title: 'Follow up — 12 plans expiring this week', priority: 'high', due: 'Today', type: 'renewal' },
  { id: 't2', title: 'Review Aarvi Saiyyad onboarding documents', priority: 'medium', due: 'Tomorrow', type: 'onboarding' },
  { id: 't3', title: 'Publish draft article: "Eating Earlier..."', priority: 'medium', due: '03 Apr', type: 'content' },
  { id: 't4', title: 'Assign doctor to 5 new patients', priority: 'high', due: 'Today', type: 'assignment' },
  { id: 't5', title: 'Send renewal reminder to 850 expired plans', priority: 'low', due: '05 Apr', type: 'renewal' },
  { id: 't6', title: 'Dr. Divya Goyal availability review', priority: 'low', due: '06 Apr', type: 'team' },
]

export const recentBlogs = [
  {
    id: 'b1',
    title: 'Best 10 foods to boost metabolism',
    category: 'Food Series',
    status: 'Live' as const,
    views: 23999,
    publishedDate: '29 Sep 2022',
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&h=60&fit=crop',
    readTime: '5 min',
  },
  {
    id: 'b2',
    title: 'How meal timing affects the body',
    category: 'Evidence Based',
    status: 'Live' as const,
    views: 18402,
    publishedDate: '29 Sep 2022',
    thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=80&h=60&fit=crop',
    readTime: '7 min',
  },
  {
    id: 'b3',
    title: 'Tips for healthy meal timing',
    category: 'Nutrition',
    status: 'Live' as const,
    views: 14200,
    publishedDate: '29 Sep 2022',
    thumbnail: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=80&h=60&fit=crop',
    readTime: '4 min',
  },
  {
    id: 'b4',
    title: 'Eating Earlier Can Reduce Hunger, Cravings, and Weight Gain',
    category: 'Fact Check',
    status: 'Draft' as const,
    views: 0,
    publishedDate: '—',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=80&h=60&fit=crop',
    readTime: '6 min',
  },
]

export const settingsCategories: SettingsCategory[] = [
  { id: '1', name: 'Active', description: 'Patient who has active subscription', color: '#22c55e', createdBy: 'Critika Agarwal (Admin)', createdAt: 'Today 09:00 AM' },
  { id: '2', name: 'In Active', description: 'Patient who has deactive subscription', color: '#ef4444', createdBy: 'Critika Agarwal (Admin)', createdAt: 'Today 09:00 AM' },
  { id: '3', name: 'Free Trial', description: 'Patient who has deactive subscription', color: '#3b82f6', createdBy: 'Critika Agarwal (Admin)', createdAt: 'Today 09:00 AM' },
  { id: '4', name: 'Expiring Soon', description: 'Patient who has deactive subscription', color: '#f59e0b', createdBy: 'Critika Agarwal (Admin)', createdAt: 'Today 09:00 AM' },
  { id: '5', name: 'Plan Extension', description: 'Patient who has deactive subscription', color: '#8b5cf6', createdBy: 'Critika Agarwal (Admin)', createdAt: 'Today 09:00 AM' },
  { id: '6', name: 'Free Account', description: 'Patient who has deactive subscription', color: '#6b7280', createdBy: 'Critika Agarwal (Admin)', createdAt: 'Today 09:00 AM' },
]
