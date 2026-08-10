import React, { useState, useEffect } from 'react';
import { UserProfile, Skill, JobRole, Domain, Technology } from './types/graph';
import { ApiService } from './services/api';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CareerExplorer } from './pages/CareerExplorer';
import { SkillGapAnalyzer } from './pages/SkillGapAnalyzer';
import { CareerPathExplorer } from './pages/CareerPathExplorer';
import { GraphExplorer } from './pages/GraphExplorer';
import { ProjectsCourses } from './pages/ProjectsCourses';
import { QueryLab } from './pages/QueryLab';
import { About } from './pages/About';
import { LoadingSkeleton, ErrorAlert } from './components/StatusComponents';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [navigationContext, setNavigationContext] = useState<any>(null);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, skillsData, rolesData, domainsData, techsData] = await Promise.all([
        ApiService.getUsers(),
        ApiService.getSkills(),
        ApiService.getJobRoles(),
        ApiService.getDomains(),
        ApiService.getTechnologies()
      ]);

      setUsers(usersData);
      setCurrentUser(usersData[0] || null);
      setSkills(skillsData);
      setJobRoles(rolesData);
      setDomains(domainsData);
      setTechnologies(techsData);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to CareerGraph backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleNavigate = (tab: string, context?: any) => {
    setNavigationContext(context || null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <LoadingSkeleton text="Connecting to CognoDB and loading graph schema..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ErrorAlert
            title="Backend Service Offline"
            message={`${error}. Please make sure the backend server is running on http://localhost:5000.`}
            onRetry={loadInitialData}
          />
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => handleNavigate(tab)}
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      users={users}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          currentUser={currentUser}
          skills={skills}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'explore' && (
        <CareerExplorer
          currentUser={currentUser}
          skills={skills}
          domains={domains}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'skill-gap' && (
        <SkillGapAnalyzer
          currentUser={currentUser}
          jobRoles={jobRoles}
          skills={skills}
          initialRoleId={navigationContext?.roleId}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'paths' && <CareerPathExplorer skills={skills} />}

      {activeTab === 'graph' && <GraphExplorer />}

      {activeTab === 'resources' && (
        <ProjectsCourses
          currentUser={currentUser}
          jobRoles={jobRoles}
          initialRoleId={navigationContext?.roleId}
        />
      )}

      {activeTab === 'query-lab' && <QueryLab />}

      {activeTab === 'about' && <About />}
    </Layout>
  );
}
export default App;
