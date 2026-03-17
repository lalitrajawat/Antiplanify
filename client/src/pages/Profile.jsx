import { useAuth } from "../hooks/useAuth";
import { User as UserIcon, Mail, Calendar, Shield } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page" style={{ padding: '2rem', color: 'white' }}>
      <h1>Profile</h1>
      <div className="profile-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #c4a5ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={40} color="white" />
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p style={{ color: '#a29ac4' }}>{user?.email}</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} color="#c4a5ff" />
            <span>Email: {user?.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#c4a5ff" />
            <span>Joined: {new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#c4a5ff" />
            <span>Account Security: Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
