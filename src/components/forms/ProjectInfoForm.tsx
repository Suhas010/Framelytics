import React from 'react';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';
import { useReportGenerator } from '../../hooks/useReportGenerator';

/**
 * Component for collecting project information before generating a report
 */
export const ProjectInfoForm: React.FC = () => {
    const { projectInfo, setProjectInfo, analysisMode } = useAnalysisContext();
    const { cancelProjectInfo, generateAndDownloadReport } = useReportGenerator();
    const config = ANALYSIS_CONFIG[analysisMode];
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProjectInfo({
            ...projectInfo,
            [name]: value
        });
    };
    
    return (
        <div className="project-info-form" style={{'--primary-color': config.primaryColor} as React.CSSProperties}>
            <h2>Project Information</h2>
            <p className="form-description">
                This information will be included in your downloaded report to provide context.
            </p>
            
            <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={projectInfo.name} 
                    onChange={handleChange}
                    placeholder="e.g. Company Website Redesign"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="team">Team</label>
                <input 
                    type="text" 
                    id="team" 
                    name="team" 
                    value={projectInfo.team} 
                    onChange={handleChange}
                    placeholder="e.g. Web Development Team"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="stageUrl">Stage URL</label>
                <input 
                    type="text" 
                    id="stageUrl" 
                    name="stageUrl" 
                    value={projectInfo.stageUrl} 
                    onChange={handleChange}
                    placeholder="e.g. https://staging.example.com"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="productionUrl">Production URL</label>
                <input 
                    type="text" 
                    id="productionUrl" 
                    name="productionUrl" 
                    value={projectInfo.productionUrl} 
                    onChange={handleChange}
                    placeholder="e.g. https://example.com"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                    id="description" 
                    name="description" 
                    value={projectInfo.description} 
                    onChange={handleChange}
                    placeholder="Brief description of the project..."
                    rows={4}
                />
            </div>
            
            <div className="form-actions">
                <button className="cancel-button" onClick={cancelProjectInfo}>
                    Cancel
                </button>
                <button className="submit-button" onClick={generateAndDownloadReport}>
                    Generate Report
                </button>
            </div>
        </div>
    );
}; 