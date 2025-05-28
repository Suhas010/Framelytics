import React, { useState } from 'react';
import { SEOIssue } from '../../types/seo-types';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';
import { VisualIssueDisplay } from './VisualIssueDisplay';

interface IssueCardProps {
    issue: SEOIssue;
}

/**
 * Component for displaying an individual SEO issue
 */
export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
    const [expanded, setExpanded] = useState(false);
    const { analysisMode } = useAnalysisContext();
    const config = ANALYSIS_CONFIG[analysisMode];
    
    return (
        <div className={`issue-card ${issue.type} ${expanded ? 'expanded' : ''}`} style={{'--primary-color': config.primaryColor} as React.CSSProperties}>
            <div className="issue-header" onClick={() => setExpanded(!expanded)}>
                <div className="issue-icon">
                    {issue.type === "error" ? "❌" : 
                     issue.type === "warning" ? "⚠️" : 
                     issue.type === "success" ? "✅" : "ℹ️"}
                </div>
                <div className="issue-title">{issue.message}</div>
                <div className="issue-expand-icon">{expanded ? '▼' : '▶'}</div>
            </div>
            
            {expanded && (
                <div className="issue-details">
                    {issue.recommendation && (
                        <div className="issue-recommendation">
                            <strong>Recommendation:</strong> {issue.recommendation}
                        </div>
                    )}
                    
                    {issue.element && (
                        <div className="issue-element">
                            <strong>Element:</strong> {issue.element}
                        </div>
                    )}
                    
                    {issue.externalResourceLink && (
                        <div className="issue-resource">
                            <strong>Learn more:</strong> <a href={issue.externalResourceLink} target="_blank" rel="noopener noreferrer">{issue.externalResourceTitle || "External resource"}</a>
                        </div>
                    )}
                    
                    <VisualIssueDisplay issue={issue} />
                </div>
            )}
        </div>
    );
}; 