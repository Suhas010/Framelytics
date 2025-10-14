import React from 'react';
import { SEOIssuePriority } from '../../types/seo-types';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';
import { IssueCard } from './IssueCard';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { ScoreDisplay } from './ScoreDisplay';

/**
 * Component for displaying the analysis results
 */
export const AnalysisResults: React.FC = () => {
    const { 
        analysisMode, 
        getCurrentResults
    } = useAnalysisContext();
    
    // Get current results
    const analysisResult = getCurrentResults();
    if (!analysisResult) return null;
    
    // Get issues for the selected category
    const getIssuesForDisplay = () => {
        // Always show all issues, no filtering
        return analysisResult.issues;
    };
    
    // Group issues by priority
    const getIssuesByPriority = (priority: SEOIssuePriority) => {
        return getIssuesForDisplay().filter(issue => issue.priority === priority);
    };
    
    // Get the score for the selected category
    const getScoreForDisplay = () => {
        // Always show overall score
        return analysisResult.score;
    };
    
    // Get title for the analysis type
    const getAnalysisTitle = () => {
        return `${analysisMode.charAt(0).toUpperCase() + analysisMode.slice(1)} Analysis Results`;
    };
    
    // Get config for current mode
    const config = ANALYSIS_CONFIG[analysisMode];
    
    return (
        <div className="results" style={{'--primary-color': config.primaryColor, '--secondary-color': config.secondaryColor} as React.CSSProperties}>
            <div className="info-banner">
                <p>{config.footerText}</p>
            </div>
            
            <h2 className="analysis-type-title">{getAnalysisTitle()}</h2>
            
            <ScoreDisplay 
                score={getScoreForDisplay()} 
                label="Overall Score"
                issues={getIssuesForDisplay()}
            />
            
            {/* Critical Issues Section */}
            <CollapsibleSection 
                title={`Critical Issues`}
                issueCount={getIssuesByPriority('critical').length}
                defaultExpanded={true}
                priority="critical"
            >
                {getIssuesByPriority('critical').length > 0 ? (
                    getIssuesByPriority('critical').map((issue, index) => (
                        <IssueCard key={`critical-${index}`} issue={issue} />
                    ))
                ) : (
                    <div className="empty-section-message">No critical issues found!</div>
                )}
            </CollapsibleSection>
            
            {/* Important Issues Section */}
            <CollapsibleSection 
                title={`Important Issues`}
                issueCount={getIssuesByPriority('important').length}
                defaultExpanded={true}
                priority="important"
            >
                {getIssuesByPriority('important').length > 0 ? (
                    getIssuesByPriority('important').map((issue, index) => (
                        <IssueCard key={`important-${index}`} issue={issue} />
                    ))
                ) : (
                    <div className="empty-section-message">No important issues found!</div>
                )}
            </CollapsibleSection>
            
            {/* Nice to Have Issues Section */}
            <CollapsibleSection 
                title={`Recommendations`}
                issueCount={getIssuesByPriority('nice-to-have').length}
                defaultExpanded={false}
                priority="nice-to-have"
            >
                {getIssuesByPriority('nice-to-have').length > 0 ? (
                    getIssuesByPriority('nice-to-have').map((issue, index) => (
                        <IssueCard key={`nice-to-have-${index}`} issue={issue} />
                    ))
                ) : (
                    <div className="empty-section-message">No recommendations at this time.</div>
                )}
            </CollapsibleSection>
        </div>
    );
}; 