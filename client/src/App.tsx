import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { AgentControlCenter } from './components/agent/AgentControlCenter';
import { JobHunterView } from './components/agent/JobHunterView';
import { ApplicationKanbanView } from './components/agent/ApplicationKanbanView';
import { EmailRadarView } from './components/agent/EmailRadarView';
import { AIAssistantChatView } from './components/agent/AIAssistantChatView';
import { ProfileVaultView } from './components/agent/ProfileVaultView';
import { AgentSettingsView } from './components/agent/AgentSettingsView';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('agent');

  const handleNavigate = (tab: string) => {
    if (tab === 'jobs') {
      setActiveTab('agent-jobs');
    } else if (tab === 'kanban') {
      setActiveTab('agent-kanban');
    } else if (tab === 'emails') {
      setActiveTab('agent-emails');
    } else if (tab === 'ai-chat') {
      setActiveTab('agent-ai-chat');
    } else if (tab === 'profile') {
      setActiveTab('agent-profile');
    } else if (tab === 'settings') {
      setActiveTab('agent-settings');
    } else {
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleNavigate}>
      {activeTab === 'agent' && <AgentControlCenter onNavigate={handleNavigate} />}
      {activeTab === 'agent-jobs' && <JobHunterView />}
      {activeTab === 'agent-kanban' && <ApplicationKanbanView />}
      {activeTab === 'agent-emails' && <EmailRadarView />}
      {activeTab === 'agent-ai-chat' && <AIAssistantChatView />}
      {activeTab === 'agent-profile' && <ProfileVaultView />}
      {activeTab === 'agent-settings' && <AgentSettingsView />}
    </Layout>
  );
}

export default App;
