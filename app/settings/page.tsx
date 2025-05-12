'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { GeneralSettings } from './general-settings';
import { PrivacySecuritySettings } from './privacy-security';
import { ApiKeysSettings } from './api-keys';
import { IntegrationsSettings } from './integrations';
import { Header } from '@/components/layout/header';

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'privacy' | 'api-keys' | 'integrations';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'privacy':
        return <PrivacySecuritySettings />;
      case 'api-keys':
        return <ApiKeysSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      default:
        return <div>Coming soon</div>;
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Header title="Settings" description="" />
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings sidebar */}
          <div className="col-span-1 space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'general'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              } text-sm`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'appearance'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              } text-sm`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'notifications'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              } text-sm`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'privacy'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              } text-sm`}
            >
              Privacy & Security
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'api-keys'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              } text-sm`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'integrations'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              } text-sm`}
            >
              Integrations
            </button>
          </div>

          {/* Settings content */}
          <div className="col-span-1 md:col-span-3">
            <div className="border rounded-lg p-6 bg-card">
              {renderSettingsContent()}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}