import { Settings as SettingsIcon, Bell, Moon, Lock, Globe } from "lucide-react";

const Settings = () => {
  return (
    <div className="settings-page" style={{ padding: '2rem', color: 'white' }}>
      <h1>Settings</h1>
      
      <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Bell size={20} color="#c4a5ff" />
            <h3>Notifications</h3>
          </div>
          <p style={{ color: '#a29ac4', fontSize: '0.9rem' }}>Manage how you receive notifications about your projects and tasks.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Moon size={20} color="#c4a5ff" />
            <h3>Appearance</h3>
          </div>
          <p style={{ color: '#a29ac4', fontSize: '0.9rem' }}>Customize the look and feel of your dashboard (Dark mode is default).</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Lock size={20} color="#c4a5ff" />
            <h3>Privacy & Security</h3>
          </div>
          <p style={{ color: '#a29ac4', fontSize: '0.9rem' }}>Manage your account security and data privacy settings.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Globe size={20} color="#c4a5ff" />
            <h3>Language</h3>
          </div>
          <p style={{ color: '#a29ac4', fontSize: '0.9rem' }}>Choose your preferred language for the interface.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
