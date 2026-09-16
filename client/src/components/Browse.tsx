import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Resource {
  id: number;
  fileName: string;
  fileUrl: string;
}

interface Module {
  id: number;
  name: string;
  moduleNo: number;
  resources: Resource[];
}

interface SubjectComponent {
  id: number;
  type: string;
  modules: Module[];
}

interface Subject {
  id: number;
  name: string;
  year: number;
  semester: number;
  components: SubjectComponent[];
  resources: Resource[];
}

interface Branch {
  id: number;
  name: string;
  subjects: Subject[];
}

interface Regulation {
  id: number;
  name: string;
  branches: Branch[];
}

const Browse: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const data = await api.get<Regulation[]>('/academic/regulations');
        setRegulations(data);
        if (data.length > 0) {
          setSelectedRegId(data[0].id);
          if (data[0].branches.length > 0) {
            setSelectedBranchId(data[0].branches[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load curriculum:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, []);

  const currentRegulation = regulations.find(r => r.id === selectedRegId);
  const currentBranch = currentRegulation?.branches.find(b => b.id === selectedBranchId);

  const filteredSubjects = (currentBranch?.subjects || []).filter(sub => {
    if (selectedYear !== 'ALL' && sub.year !== selectedYear) return false;
    if (selectedSemester !== 'ALL' && sub.semester !== selectedSemester) return false;
    return true;
  });

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading Curriculum...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px', color: '#0f172a' }}>
          Curriculum & Resource Browser
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Open cross-branch access: easily explore subjects and course materials across departments.
        </p>
      </header>

      {/* Filter Controls Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Regulation
          </label>
          <select 
            value={selectedRegId || ''} 
            onChange={(e) => {
              const regId = Number(e.target.value);
              setSelectedRegId(regId);
              const reg = regulations.find(r => r.id === regId);
              if (reg && reg.branches.length > 0) {
                setSelectedBranchId(reg.branches[0].id);
              } else {
                setSelectedBranchId(null);
              }
            }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            {regulations.map(reg => (
              <option key={reg.id} value={reg.id}>{reg.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Branch / Department
          </label>
          <select 
            value={selectedBranchId || ''} 
            onChange={(e) => setSelectedBranchId(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            {currentRegulation?.branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Academic Year
          </label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="ALL">All Years</option>
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Semester
          </label>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="ALL">All Semesters</option>
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No subjects cataloged for the selected filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredSubjects.map(sub => (
            <div key={sub.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ background: '#f1f5f9', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{sub.name}</h3>
                <span style={{ fontSize: '0.85rem', color: '#475569', background: '#e2e8f0', padding: '3px 10px', borderRadius: '9999px', fontWeight: 600 }}>
                  Year {sub.year} • Sem {sub.semester}
                </span>
              </div>

              <div style={{ padding: '20px' }}>
                {sub.resources.length > 0 && (
                  <div style={{ marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>General Resources / Syllabus</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {sub.resources.map(res => (
                        <a 
                          key={res.id} 
                          href={res.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}
                        >
                          📄 {res.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {sub.components.map(comp => (
                    <div key={comp.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: comp.type === 'THEORY' ? '#0284c7' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{comp.type === 'THEORY' ? '📖' : '🧪'}</span> {comp.type}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {comp.modules.map(mod => (
                          <div key={mod.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                              {mod.name} {mod.moduleNo}
                            </div>
                            {mod.resources.length > 0 ? (
                              <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {mod.resources.map(res => (
                                  <a 
                                    key={res.id} 
                                    href={res.fileUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ fontSize: '0.8rem', color: '#0284c7', textDecoration: 'underline' }}
                                  >
                                    📄 {res.fileName}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No files attached yet</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;

