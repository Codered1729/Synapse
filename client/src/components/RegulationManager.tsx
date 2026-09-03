import { useState, useEffect } from 'react';
import './RegulationManager.css';

interface Branch {
    id: number;
    name: string;
    regulationId: number;
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

    const fetchRegulation = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/academic/regulations');
            const data = await res.json();
            setRegulations(data);
        } catch (err) {
            console.error("failed to fetch regulations", err);
        }
    };

    useEffect(() => {
        fetchRegulation();
    }, []);

    const handleCreateRegulation = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/api/academic/regulations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newRegulation })
            });
            setNewRegulation('');
            fetchRegulation();
        } catch (err) {
            console.error("failed to save a regulation", err);
        }
    };

    const handleCreateBranch = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/api/academic/branches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: newBranch, 
                    regulationId: selectedRegId 
                })
            });
            setNewBranch('');
            setSelectedRegId(''); 
            fetchRegulation(); 
        } catch (err) {
            console.error("failed to save a branch", err);
        }
    };

    return (
        <div className="manager-container">
            <h2>Academic Manager</h2>
            
            <div className="forms-wrapper">
                <form onSubmit={handleCreateRegulation} className="manager-form">
                    <h3>Add Regulation</h3>
                    <input 
                        type="text"
                        value={newRegulation}
                        onChange={(e) => setNewRegulation(e.target.value)}
                        placeholder="e.g., R22"
                        required
                    />
                    <button type="submit">Add Regulation</button>
                </form>

                <form onSubmit={handleCreateBranch} className="manager-form">
                    <h3>Add Branch</h3>
                    <select 
                        value={selectedRegId}
                        onChange={(e) => setSelectedRegId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Regulation</option>
                        {regulations.map(reg => (
                            <option key={reg.id} value={reg.id}>{reg.name}</option>
                        ))}
                    </select>
                    <input 
                        type="text"
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        placeholder="e.g., B.Tech CSE"
                        required
                    />
                    <button type="submit">Add Branch</button>
                </form>
            </div>

            <hr />

            <div>
                {regulations.map((reg) => (
                    <div key={reg.id} className="regulation-item">
                        <h3 className="regulation-title">{reg.name}</h3>
                        
                        <ul className="branch-list">
                            {reg.branches.length === 0 ? (
                                <li className="empty-branch">No branches assigned</li>
                            ) : (
                                reg.branches.map(branch => (
                                    <li key={branch.id}>{branch.name}</li>
                                ))
                            )}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RegulationManager;