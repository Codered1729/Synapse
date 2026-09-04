import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Module State (Prefix + Number)
    const [selectedComponentId, setSelectedComponentId] = useState('');
    const [modulePrefix, setModulePrefix] = useState('Unit');
    const [moduleNumber, setModuleNumber] = useState('');

    // Resource State
    const [newResourceName, setNewResourceName] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [resourceSubjectId, setResourceSubjectId] = useState('');
    const [isGeneralResource, setIsGeneralResource] = useState(true);
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

    const navigate = useNavigate();
    const getToken = () => localStorage.getItem("token");
    
    const fetchRegulation = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/academic/regulations', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            const data = await res.json();
            setRegulations(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchRegulation(); }, []);

    const handleCreateRegulation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/academic/regulations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ name: newRegulation })
        });
        setNewRegulation(''); fetchRegulation();
    };

    const handleCreateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/academic/branches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ name: newBranch, regulationId: Number(selectedRegId) })
        });
        setNewBranch(''); setSelectedRegId(''); fetchRegulation(); 
    };

    const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/academic/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({
                name: newSubjectName, year: Number(newSubjectYear),
                semester: Number(newSubjectSemester), branchId: Number(selectedBranchId)
            })
        });
        setNewSubjectName(''); setNewSubjectYear(''); setNewSubjectSemester('');
        setSelectedBranchId(''); setSubjectFormRegId(''); fetchRegulation();
    };

    const handleCreateComponent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/academic/components', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ type: newComponentType, subjectId: Number(selectedSubjectId) })
        });
        setNewComponentType(''); setSelectedSubjectId(''); fetchRegulation();
    };

    const handleCreateModule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/academic/modules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ 
                name: modulePrefix,            // e.g., "Unit"
                moduleNo: Number(moduleNumber),// e.g., 1
                componentId: Number(selectedComponentId) 
            })
        });
        setModuleNumber(''); setSelectedComponentId(''); fetchRegulation();
    };

    const handleCreateResource = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/academic/resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({
                fileName: newResourceName,
                fileUrl: newResourceUrl,
                subjectId: Number(resourceSubjectId),
                moduleIds: isGeneralResource ? [] : selectedModuleIds.map(Number)
            })
        });
        setNewResourceName(''); setNewResourceUrl(''); setResourceSubjectId('');
        setSelectedModuleIds([]); setIsGeneralResource(true); fetchRegulation();
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

    return (
        <div className="manager-container">
            <h2>Academic Manager</h2>
            
            <div className="forms-wrapper">
                <form onSubmit={handleCreateRegulation} className="manager-form">
                    <h3>1. Add Regulation</h3>
                    <input type="text" value={newRegulation} onChange={(e) => setNewRegulation(e.target.value)} placeholder="e.g., R22" required />
                    <button type="submit">Add</button>
                </form>

                <form onSubmit={handleCreateBranch} className="manager-form">
                    <h3>2. Add Branch</h3>
                    <select value={selectedRegId} onChange={(e) => setSelectedRegId(e.target.value)} required>
                        <option value="" disabled>Select Regulation</option>
                        {regulations.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                    </select>
                    <input type="text" value={newBranch} onChange={(e) => setNewBranch(e.target.value)} placeholder="e.g., CSE" required />
                    <button type="submit">Add</button>
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
                    <input type="number" value={newSubjectYear} onChange={(e) => setNewSubjectYear(e.target.value)} placeholder="Year (e.g., 3)" required />
                    <input type="number" value={newSubjectSemester} onChange={(e) => setNewSubjectSemester(e.target.value)} placeholder="Semester (e.g., 1)" required />
                    <button type="submit">Add</button>
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
                    <button type="submit">Add</button>
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
                    <button type="submit">Add</button>
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

            <hr />

            <div className="hierarchy-display">
                {regulations.map((reg) => (
                    <div key={reg.id} className="regulation-item">
                        <h2>{reg.name}</h2>
                        
                        {reg.branches.map(branch => (
                            <div key={branch.id} className="branch-item">
                                <h3>{branch.name}</h3>
                                
                                {branch.subjects.map(sub => (
                                    <div key={sub.id} className="subject-item">
                                        <h4>{sub.name} (Yr {sub.year} - Sem {sub.semester})</h4>
                                        
                                        {sub.resources.length > 0 && (
                                            <div className="general-resources">
                                                <strong>General Files:</strong>
                                                {sub.resources.map(res => (
                                                    <a key={res.id} href={res.fileUrl} target="_blank" rel="noreferrer" className="resource-link">📄 {res.fileName}</a>
                                                ))}
                                            </div>
                                        )}

                                        <div className="components-container">
                                            {sub.components.map(comp => (
                                                <div key={comp.id} className="component-box">
                                                    <h5>{comp.type}</h5>
                                                    
                                                    {comp.modules.map(mod => (
                                                        <div key={mod.id} className="module-item">
                                                            <strong>{mod.name} {mod.moduleNo}</strong>
                                                            <div className="module-resources">
                                                                {mod.resources.map(res => (
                                                                    <a key={res.id} href={res.fileUrl} target="_blank" rel="noreferrer" className="resource-link">📄 {res.fileName}</a>
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