import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import SignIn from '../pages/auth/SignIn'
import Dashboard from '../pages/dashboard/Dashboard'
import PatientList from '../pages/patients/PatientList'
import PatientProfile from '../pages/patients/PatientProfile'
import PrescriptionForm from '../pages/patients/PrescriptionForm'
import ArticleList from '../pages/articles/ArticleList'
import ArticleEditor from '../pages/articles/ArticleEditor'
import TeamList from '../pages/team/TeamList'
import TeamMemberForm from '../pages/team/TeamMemberForm'
import Settings from '../pages/settings/Settings'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <SignIn />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'patients', element: <PatientList /> },
      { path: 'patients/:id', element: <PatientProfile /> },
      { path: 'patients/:id/prescription/new', element: <PrescriptionForm /> },
      { path: 'articles', element: <ArticleList /> },
      { path: 'articles/new', element: <ArticleEditor /> },
      { path: 'articles/:id', element: <ArticleEditor /> },
      { path: 'team', element: <TeamList /> },
      { path: 'team/new', element: <TeamMemberForm /> },
      { path: 'team/:id', element: <TeamMemberForm /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
