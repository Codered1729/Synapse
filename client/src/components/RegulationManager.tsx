import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './RegulationManager.css';

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
    branchId: number;
    components: SubjectComponent[];
    resources: Resource[]; 
}

interface Branch {
    id: number;
    name: string;
    regulationId: number;
    subjects: Subject[]; 
}

interface Regulation {
    id: number;
    name: string;
    branches: Branch[];
}

function RegulationManager() {
    const [regulations, setRegulations] = useState<Regulation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionMessage, setActionMessage] = useState<string>('');
    
    // Form States
    const [newRegulation, setNewRegulation] = useState('');
    const [newBranch, setNewBranch] = useState('');
    const [selectedRegId, setSelectedRegId] = useState('');
    
    const [subjectFormRegId, setSubjectFormRegId] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectYear, setNewSubjectYear] = useState('');
    const [newSubjectSemester, setNewSubjectSemester] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState('');

    const [newComponentType, setNewComponentType] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    const [selectedComponentId, setSelectedComponentId] = useState('');
    const [modulePrefix, setModulePrefix] = useState('Unit');
    const [moduleNumber, setModuleNumber] = useState('');

    const [newResourceName, setNewResourceName] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [resourceSubjectId, setResourceSubjectId] = useState('');
    const [isGeneralResource, setIsGeneralResource] = useState(true);
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

    const [refreshIndex, setRefreshIndex] = useState(0);

    const triggerRefresh = () => {
        setRefreshIndex(prev => prev + 1);
    };

    useEffect(() => { 
        let isCancelled = false;
        const loadHierarchy = async () => {
            try {
                const data = await api.get<Regulation[]>('/academic/regulations');
                if (!isCancelled) {
                    setRegulations(data);
                }
            } catch (err: unknown) {
                if (!isCancelled) {
                    console.error('Error fetching regulations:', err);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        loadHierarchy();
        return () => {
            isCancelled = true;
        };
    }, [refreshIndex]);

    const showToast = (msg: string) => {
        setActionMessage(msg);
        setTimeout(() => setActionMessage(''), 4000);
    };

    const handleDelete = async (endpoint: string, id: number, label: string) => {
        if (!window.confirm(`Are you sure you want to delete "${label}"? This will delete all attached child data!`)) {
            return;
        }
        try {
            await api.delete(`/academic/${endpoint}/${id}`);
            showToast(`Deleted ${label} successfully`);
            triggerRefresh();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Delete failed');
        }
    };

    const handleCreateRegulation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.post('/academic/regulations', { name: newRegulation });
            setNewRegulation(''); 
            showToast('Regulation created');
            triggerRefresh();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to create regulation');
        }
    };

    const handleCreateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.post('/academic/branches', { name: newBranch, regulationId: Number(selectedRegId) });
            setNewBranch(''); 
            setSelectedRegId(''); 
            showToast('Branch created');
            triggerRefresh(); 
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to create branch');
        }
    };

    const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.post('/academic/subjects', {
                name: newSubjectName, 
                year: Number(newSubjectYear),
                semester: Number(newSubjectSemester), 
                branchId: Number(selectedBranchId)
            });
            setNewSubjectName(''); 
            setNewSubjectYear(''); 
            setNewSubjectSemester('');
            setSelectedBranchId(''); 
            setSubjectFormRegId(''); 
            showToast('Subject created');
            triggerRefresh();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to create subject');
        }
    };

    const handleCreateComponent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.post('/academic/components', { type: newComponentType, subjectId: Number(selectedSubjectId) });
            setNewComponentType(''); 
            setSelectedSubjectId(''); 
            showToast('Component created');
            triggerRefresh();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to create component');
        }
    };

    const handleCreateModule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.post('/academic/modules', { 
                name: modulePrefix,
                moduleNo: Number(moduleNumber),
                componentId: Number(selectedComponentId) 
            });
            setModuleNumber(''); 
            setSelectedComponentId(''); 
            showToast('Module created');
            triggerRefresh();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to create module');
        }
    };

    const handleCreateResource = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.post('/academic/resources', {
                fileName: newResourceName,
                fileUrl: newResourceUrl,
                subjectId: Number(resourceSubjectId),
                moduleIds: isGeneralResource ? [] : selectedModuleIds.map(Number)
            });
            setNewResourceName(''); 
            setNewResourceUrl(''); 
            setResourceSubjectId('');
            setSelectedModuleIds([]); 
            setIsGeneralResource(true); 
            showToast('Resource added');
            triggerRefresh();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to create resource');
        }
    };

    const handleModuleToggle = (moduleId: string) => {
        setIsGeneralResource(false);
        setSelectedModuleIds(prev => 
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    const getComponentsForSubject = (subjectId: string) => {
        if (!subjectId) return [];
        for (const reg of regulations) {
            for (const branch of reg.branches) {
                const subject = branch.subjects.find(s => s.id === Number(subjectId));
                if (subject) return subject.components;
            }
        }
        return [];
    };

    if (loading) {
        return <div style={{ padding: '24px', textAlign: 'center' }}>Loading Academic Hierarchy...</div>;
    }

    return (
        <div className="manager-container">
            <header style={{ marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', color: '#0f172a' }}>Academic Hierarchy Manager</h1>
                <p style={{ margin: 0, color: '#64748b' }}>Configure regulations, branches, subjects, and curriculum modules.</p>
                {actionMessage && (
                    <div style={{ marginTop: '12px', padding: '8px 16px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '0.9rem', display: 'inline-block' }}>
                        ✓ {actionMessage}
                    </div>
                )}
            </header>
            
            <div className="forms-wrapper">
                <form onSubmit={handleCreateRegulation} className="manager-form">
                    <h3>1. Add Regulation</h3>
                    <input type="text" value={newRegulation} onChange={(e) => setNewRegulation(e.target.value)} placeholder="e.g., R22" required />
                    <button type="submit">Add Regulation</button>
                </form>

                <form onSubmit={handleCreateBranch} className="manager-form">
                    <h3>2. Add Branch</h3>
                    <select value={selectedRegId} onChange={(e) => setSelectedRegId(e.target.value)} required>
                        <option value="" disabled>Select Regulation</option>
                        {regulations.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                    </select>
                    <input type="text" value={newBranch} onChange={(e) => setNewBranch(e.target.value)} placeholder="e.g., CSE" required />
                    <button type="submit">Add Branch</button>
                </form>

                <form onSubmit={handleCreateSubject} className="manager-form">
                    <h3>3. Add Subject</h3>
                    <select value={subjectFormRegId} onChange={(e) => { setSubjectFormRegId(e.target.value); setSelectedBranchId(''); }} required>
                        <option value="" disabled>Select Regulation</option>
                        {regulations.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                    </select>
                    <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} required disabled={!subjectFormRegId}>
                        <option value="" disabled>Select Branch</option>
                        {subjectFormRegId && regulations.find(reg => reg.id === Number(subjectFormRegId))?.branches.map(branch => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                    </select>
                    <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject Name" required />
                    <input type="number" value={newSubjectYear} onChange={(e) => setNewSubjectYear(e.target.value)} placeholder="Year (e.g., 2)" required />
                    <input type="number" value={newSubjectSemester} onChange={(e) => setNewSubjectSemester(e.target.value)} placeholder="Semester (e.g., 1)" required />
                    <button type="submit">Add Subject</button>
                </form>

                <form onSubmit={handleCreateComponent} className="manager-form">
                    <h3>4. Add Component</h3>
                    <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} required>
                        <option value="" disabled>Select Subject</option>
                        {regulations.flatMap(reg => reg.branches).map(branch => (
                            <optgroup key={branch.id} label={branch.name}>
                                {branch.subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                            </optgroup>
                        ))}
                    </select>
                    <select value={newComponentType} onChange={(e) => setNewComponentType(e.target.value)} required>
                        <option value="" disabled>Select Type</option>
                        <option value="THEORY">THEORY</option>
                        <option value="LAB">LAB</option>
                        <option value="ASSIGNMENT">ASSIGNMENT</option>
                    </select>
                    <button type="submit">Add Component</button>
                </form>

                <form onSubmit={handleCreateModule} className="manager-form">
                    <h3>5. Add Unit / Exp.</h3>
                    <select value={selectedComponentId} onChange={(e) => setSelectedComponentId(e.target.value)} required>
                        <option value="" disabled>Select Component</option>
                        {regulations.flatMap(r => r.branches).flatMap(b => b.subjects).map(sub => (
                            <optgroup key={sub.id} label={sub.name}>
                                {sub.components.map(comp => (
                                    <option key={comp.id} value={comp.id}>{comp.type}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <select value={modulePrefix} onChange={(e) => setModulePrefix(e.target.value)} style={{ flex: 1 }}>
                            <option value="Unit">Unit</option>
                            <option value="Experiment">Experiment</option>
                            <option value="Assignment">Assignment</option>
                        </select>
                        <input type="number" value={moduleNumber} onChange={(e) => setModuleNumber(e.target.value)} placeholder="No." min="1" required style={{ width: '70px' }} />
                    </div>
                    <button type="submit">Add Module</button>
                </form>

                <form onSubmit={handleCreateResource} className="manager-form">
                    <h3>6. Add Resource</h3>
                    <select value={resourceSubjectId} onChange={(e) => { setResourceSubjectId(e.target.value); setSelectedModuleIds([]); setIsGeneralResource(true); }} required>
                        <option value="" disabled>Select Subject</option>
                        {regulations.flatMap(r => r.branches).map(branch => (
                            <optgroup key={branch.id} label={branch.name}>
                                {branch.subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                            </optgroup>
                        ))}
                    </select>
                    <input type="text" value={newResourceName} onChange={(e) => setNewResourceName(e.target.value)} placeholder="File Name (e.g., Unit2.ppt)" required />
                    <input type="text" value={newResourceUrl} onChange={(e) => setNewResourceUrl(e.target.value)} placeholder="URL or Path (/files/unit2.ppt)" required />
                    
                    {resourceSubjectId && (
                        <div className="checkbox-group" style={{ maxHeight: '180px' }}>
                            <label className="checkbox-title">Tag Resource To:</label>
                            
                            <label className="checkbox-label" style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={isGeneralResource}
                                    onChange={(e) => {
                                        setIsGeneralResource(e.target.checked);
                                        if (e.target.checked) setSelectedModuleIds([]);
                                    }} 
                                />
                                General Subject Resource
                            </label>

                            {!isGeneralResource && getComponentsForSubject(resourceSubjectId).map(comp => (
                                <div key={comp.id} style={{ marginBottom: '10px' }}>
                                    <strong style={{ fontSize: '0.85em', color: '#666', textTransform: 'uppercase' }}>{comp.type}</strong>
                                    {comp.modules.map(mod => (
                                        <label key={mod.id} className="checkbox-label" style={{ marginLeft: '10px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedModuleIds.includes(String(mod.id))}
                                                onChange={() => handleModuleToggle(String(mod.id))} 
                                            />
                                            {mod.name} {mod.moduleNo}
                                        </label>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                    <button type="submit">Add Resource</button>
                </form>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <h2 style={{ color: '#0f172a', marginBottom: '16px' }}>Curriculum Hierarchy Overview</h2>
            <div className="hierarchy-display">
                {regulations.map((reg) => (
                    <div key={reg.id} className="regulation-item">
                        <div className="item-header">
                            <h2>{reg.name}</h2>
                            <button className="delete-btn" onClick={() => handleDelete('regulations', reg.id, reg.name)}>
                                🗑️ Delete Regulation
                            </button>
                        </div>
                        
                        {reg.branches.map(branch => (
                            <div key={branch.id} className="branch-item">
                                <div className="item-header">
                                    <h3>{branch.name}</h3>
                                    <button className="delete-btn" onClick={() => handleDelete('branches', branch.id, branch.name)}>
                                        🗑️ Delete Branch
                                    </button>
                                </div>
                                
                                {branch.subjects.map(sub => (
                                    <div key={sub.id} className="subject-item">
                                        <div className="item-header">
                                            <h4>{sub.name} (Yr {sub.year} - Sem {sub.semester})</h4>
                                            <button className="delete-btn" onClick={() => handleDelete('subjects', sub.id, sub.name)}>
                                                🗑️ Delete Subject
                                            </button>
                                        </div>
                                        
                                        {sub.resources.length > 0 && (
                                            <div className="general-resources">
                                                <strong>General Files:</strong>
                                                {sub.resources.map(res => (
                                                    <span key={res.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <a href={res.fileUrl} target="_blank" rel="noreferrer" className="resource-link">📄 {res.fileName}</a>
                                                        <button className="delete-btn" onClick={() => handleDelete('resources', res.id, res.fileName)}>×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="components-container">
                                            {sub.components.map(comp => (
                                                <div key={comp.id} className="component-box">
                                                    <div className="item-header">
                                                        <h5>{comp.type}</h5>
                                                        <button className="delete-btn" onClick={() => handleDelete('components', comp.id, comp.type)}>
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                    
                                                    {comp.modules.map(mod => (
                                                        <div key={mod.id} className="module-item">
                                                            <div className="item-header">
                                                                <strong>{mod.name} {mod.moduleNo}</strong>
                                                                <button className="delete-btn" onClick={() => handleDelete('modules', mod.id, `${mod.name} ${mod.moduleNo}`)}>
                                                                    ×
                                                                </button>
                                                            </div>
                                                            <div className="module-resources">
                                                                {mod.resources.map(res => (
                                                                    <span key={res.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                        <a href={res.fileUrl} target="_blank" rel="noreferrer" className="resource-link">📄 {res.fileName}</a>
                                                                        <button className="delete-btn" onClick={() => handleDelete('resources', res.id, res.fileName)}>×</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RegulationManager;