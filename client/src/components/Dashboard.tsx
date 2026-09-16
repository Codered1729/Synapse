import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../services/api';

interface Stats {
  regulationsCount: number;
  branchesCount: number;
  subjectsCount: number;
  resourcesCount: number;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    regulationsCount: 0,
    branchesCount: 0,
    subjectsCount: 0,
    resourcesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        interface RegItem {
          branches: Array<{
            subjects: Array<{
              resources: unknown[];
              components: Array<{
                modules: Array<{
                  resources: unknown[];
                }>;
              }>;
            }>;
          }>;
        }
        const data = await api.get<RegItem[]>('/academic/regulations');
        let branches = 0;
        let subjects = 0;
        let resources = 0;

        for (const reg of data) {
          branches += reg.branches.length;
          for (const b of reg.branches) {
            subjects += b.subjects.length;
            for (const s of b.subjects) {
              resources += s.resources.length;
              for (const c of s.components) {
                for (const m of c.modules) {
                  resources += m.resources.length;
                }
              }
            }
          }
        }

        setStats({
          regulationsCount: data.length,
          branchesCount: branches,
          subjectsCount: subjects,
          resourcesCount: resources,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 8px', color: '#0f172a' }}>
          Welcome back, {user?.email.split('@')[0]}!
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Centralized academic resource repository for CVR College of Engineering.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active Regulations</span>
          <h2 style={{ fontSize: '2rem', margin: '8px 0 0', color: '#0284c7' }}>{loading ? '...' : stats.regulationsCount}</h2>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Departments</span>
          <h2 style={{ fontSize: '2rem', margin: '8px 0 0', color: '#0f172a' }}>{loading ? '...' : stats.branchesCount}</h2>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Subjects Cataloged</span>
          <h2 style={{ fontSize: '2rem', margin: '8px 0 0', color: '#10b981' }}>{loading ? '...' : stats.subjectsCount}</h2>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Resources Shared</span>
          <h2 style={{ fontSize: '2rem', margin: '8px 0 0', color: '#8b5cf6' }}>{loading ? '...' : stats.resourcesCount}</h2>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '16px' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Link 
          to="/browse" 
          style={{ 
            textDecoration: 'none', 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '20px', 
            display: 'block',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h4 style={{ margin: '0 0 8px', color: '#0284c7' }}>📚 Browse Curriculum</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            Explore R22 CSE semester syllabi, lecture notes, question banks, and experiment manuals.
          </p>
        </Link>

        <Link 
          to="/upload" 
          style={{ 
            textDecoration: 'none', 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '20px', 
            display: 'block',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h4 style={{ margin: '0 0 8px', color: '#10b981' }}>📤 Upload Resources</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            Share notes, presentations, or previous year papers tagged to specific units or experiments.
          </p>
        </Link>

        {isAdmin && (
          <Link 
            to="/regulations" 
            style={{ 
              textDecoration: 'none', 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '20px', 
              display: 'block',
              color: 'inherit',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <h4 style={{ margin: '0 0 8px', color: '#ef4444' }}>⚙️ Academic Manager</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Configure regulations, branches, subject components, and module structures dynamically.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

