import React from 'react';
import { SEOIssue, SEOIssuePriority } from '../../types/seo-types';
import { PRIORITY_EMOJI } from '../../context/AnalysisContext';

interface ScoreDisplayProps {
    score: number;
    label: string;
    issues: SEOIssue[];
}

/**
 * Component for displaying the analysis score and issue counts
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, label, issues }) => {
    // Get CSS class for score
    const getScoreClass = (score: number) => {
        if (score >= 90) return "score-excellent";
        if (score >= 70) return "score-good";
        if (score >= 50) return "score-average";
        return "score-poor";
    };
    
    // Group issues by priority
    const getIssuesByPriority = (priority: SEOIssuePriority) => {
        return issues.filter(issue => issue.priority === priority);
    };
    
    return (
        <div className="score-overview">
            <div className={`score ${getScoreClass(score)}`}>
                {score}
            </div>
            <div className="score-stats">
                <div className="score-label">
                    {label}
                </div>
                <div className="score-issues-count">
                    <span className="count-item">
                        <span className="count-icon">{PRIORITY_EMOJI.critical}</span>
                        {getIssuesByPriority("critical").length}
                    </span>
                    <span className="count-item">
                        <span className="count-icon">{PRIORITY_EMOJI.important}</span>
                        {getIssuesByPriority("important").length}
                    </span>
                    <span className="count-item">
                        <span className="count-icon">{PRIORITY_EMOJI["nice-to-have"]}</span>
                        {getIssuesByPriority("nice-to-have").length}
                    </span>
                </div>
            </div>
        </div>
    );
}; 