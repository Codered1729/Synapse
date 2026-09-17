import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Regulation {
  id: number;
  name: string;
  branches: Array<{
    id: number;
    name: string;
    subjects: Array<{
      id: number;
      name: string;
      components: Array<{
        id: number;
        type: string;
        modules: Array<{
          id: number;
          name: string;
          moduleNo: number;
        }>;
      }>;
    }>;
  }>;
}

const Upload: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [originalAuthor , setOriginalAuthor] = useState('');
  const [isGeneral, setIsGeneral] = useState(true);
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Regulation[]>('/academic/regulations');
        setRegulations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allSubjects = regulations.flatMap(r => 
    r.branches.flatMap(b => 
      b.subjects.map(s => ({
        ...s,
        branchName: b.name,
        regulationName: r.name
      }))
    )
  );

  const currentSubject = allSubjects.find(s => s.id === Number(selectedSubjectId));

  const handleModuleToggle = (id: number) => {
    setIsGeneral(false);
    setSelectedModuleIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !fileName || !fileUrl) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      await api.post('/academic/resources', {
        fileName,
        fileUrl,
        originalAuthor,
        subjectId: Number(selectedSubjectId),
        moduleIds: isGeneral ? [] : selectedModuleIds
      });

      setStatusMessage({ type: 'success', text: `Resource "${fileName}" successfully shared!` });
      setFileName('');
      setFileUrl('');
      setOriginalAuthor('');
      setSelectedModuleIds([]);
      setIsGeneral(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatusMessage({ type: 'error', text: err.message });
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to upload resource' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading upload form...</div>;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px', color: '#0f172a' }}>
          Upload Academic Resource
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Contribute study notes, lecture slides, question banks, or experiment guides.
        </p>
      </header>

      {statusMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${statusMessage.type === 'success' ? '#86efac' : '#f87171'}`,
          color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '0.9rem'
        }}>
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleUpload} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Target Subject *
          </label>
          <select 
            value={selectedSubjectId} 
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setSelectedModuleIds([]);
              setIsGeneral(true);
            }} 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
          >
            <option value="" disabled>Select Subject</option>
            {allSubjects.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.branchName} - {sub.regulationName})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Original Author/ source Credit
         </label>
         <input type = "text" placeholder='e.g teacher or bookname or student' 
         value = {originalAuthor} 
         onChange={(e)=>{setOriginalAuthor(e.target.value)}}
         style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
        />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Resource Title / File Name *
          </label>
          <input 
            type="text" 
            placeholder="e.g. Unit 2 Trees & Graphs Lecture Notes.pdf" 
            value={fileName} 
            onChange={(e) => setFileName(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Resource Link or Cloud URL *
          </label>
          <input 
            type="text" 
            placeholder="e.g. https://drive.google.com/... or /files/notes.pdf" 
            value={fileUrl} 
            onChange={(e) => setFileUrl(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>

        {currentSubject && (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
              Tagging Options
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginBottom: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isGeneral} 
                onChange={(e) => {
                  setIsGeneral(e.target.checked);
                  if (e.target.checked) setSelectedModuleIds([]);
                }} 
              />
              <span>General Resource (Syllabus, Full Question Bank, Reference Book)</span>
            </label>

            {!isGeneral && currentSubject.components.map(comp => (
              <div key={comp.id} style={{ marginTop: '10px', paddingLeft: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{comp.type}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {comp.modules.map(mod => (
                    <label key={mod.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedModuleIds.includes(mod.id)} 
                        onChange={() => handleModuleToggle(mod.id)} 
                      />
                      {mod.name} {mod.moduleNo}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          type="submit" 
          disabled={submitting} 
          style={{ 
            marginTop: '8px', 
            padding: '12px', 
            background: '#0284c7', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '1rem', 
            fontWeight: 600, 
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? 'Sharing Resource...' : 'Submit Resource'}
        </button>
      </form>
    </div>
  );
};

export default Upload;

