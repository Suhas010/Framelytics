import React from 'react';
import { SEOCategory, SEOIssuePriority } from '../../types/seo-types';
import { useAnalysisContext, ANALYSIS_CONFIG, PRIORITY_EMOJI } from '../../context/AnalysisContext';
import { useReportGenerator } from '../../hooks/useReportGenerator';
import { IssueCard } from './IssueCard';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { ScoreDisplay } from './ScoreDisplay';
import { CategoryTabs } from './CategoryTabs';

/**
 * Component for displaying the analysis results
 */
export const AnalysisResults: React.FC = () => {
    const { 
        analysisMode, 
        getCurrentResults, 
        getCurrentCategory, 
        setCurrentCategory 
    } = useAnalysisContext();
    
    const { initiateDownload } = useReportGenerator();
    
    // Get current results
    const analysisResult = getCurrentResults();
    if (!analysisResult) return null;
    
    // Get current category
    const selectedCategory = getCurrentCategory();
    
    // Get issues for the selected category
    const getIssuesForDisplay = () => {
        if (selectedCategory === 'all') {
            return analysisResult.issues;
        }
        
        return analysisResult.categories[selectedCategory].issues;
    };
    
    // Group issues by priority
    const getIssuesByPriority = (priority: SEOIssuePriority) => {
        return getIssuesForDisplay().filter(issue => issue.priority === priority);
    };
    
    // Get the score for the selected category
    const getScoreForDisplay = () => {
        if (selectedCategory === 'all') {
            return analysisResult.score;
        }
        
        return analysisResult.categories[selectedCategory].score;
    };
    
    // Get categories with issues
    const getCategoriesWithIssues = (): SEOCategory[] => {
        return Object.entries(analysisResult.categories)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_category, categoryData]) => categoryData.issues.length > 0)
            .map(([category]) => category as SEOCategory);
    };
    
    // Format category name for display
    const formatCategoryName = (category: SEOCategory | 'all') => {
        if (category === 'all') return 'All Issues';
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    // Get analysis title based on mode
    const getAnalysisTitle = () => {
        switch (analysisMode) {
            case 'accessibility':
                return `${ANALYSIS_CONFIG.accessibility.icon} Accessibility Analysis`;
            case 'links':
                return `${ANALYSIS_CONFIG.links.icon} Broken Links Check`;
            default:
                return `${ANALYSIS_CONFIG.seo.icon} SEO Analysis`;
        }
    };
    
    const config = ANALYSIS_CONFIG[analysisMode];

    return (
        <div className="results" style={{'--primary-color': config.primaryColor, '--secondary-color': config.secondaryColor} as React.CSSProperties}>
            <div className="info-banner">
                <p>{config.footerText}</p>
            </div>
            
            <h2 className="analysis-type-title">{getAnalysisTitle()}</h2>
            
            <ScoreDisplay 
                score={getScoreForDisplay()} 
                label={selectedCategory === 'all' ? 'Overall Score' : `${formatCategoryName(selectedCategory)} Score`}
                issues={getIssuesForDisplay()}
            />
            
            <CategoryTabs 
                categories={getCategoriesWithIssues()}
                selectedCategory={selectedCategory}
                onSelectCategory={setCurrentCategory}
            />
            
            <div className="issues-container">
                {/* Critical Issues Section */}
                <CollapsibleSection 
                    title={`${PRIORITY_EMOJI.critical} Critical Issues`}
                    issueCount={getIssuesByPriority("critical").length}
                    defaultExpanded={getIssuesByPriority("critical").length > 0}
                >
                    {getIssuesByPriority("critical").length > 0 ? (
                        getIssuesByPriority("critical").map((issue, index) => (
                            <IssueCard key={index} issue={issue} />
                        ))
                    ) : (
                        <div className="empty-section-message">
                            No critical issues found. Great job!
                        </div>
                    )}
                </CollapsibleSection>
                
                {/* Important Issues Section */}
                <CollapsibleSection 
                    title={`${PRIORITY_EMOJI.important} Important Issues`}
                    issueCount={getIssuesByPriority("important").length}
                    defaultExpanded={getIssuesByPriority("important").length > 0 && getIssuesByPriority("critical").length === 0}
                >
                    {getIssuesByPriority("important").length > 0 ? (
                        getIssuesByPriority("important").map((issue, index) => (
                            <IssueCard key={index} issue={issue} />
                        ))
                    ) : (
                        <div className="empty-section-message">
                            No important issues found. Great job!
                        </div>
                    )}
                </CollapsibleSection>
                
                {/* Nice to Have Issues Section */}
                <CollapsibleSection 
                    title={`${PRIORITY_EMOJI["nice-to-have"]} Optimization Tips`}
                    issueCount={getIssuesByPriority("nice-to-have").length}
                    defaultExpanded={false}
                >
                    {getIssuesByPriority("nice-to-have").length > 0 ? (
                        getIssuesByPriority("nice-to-have").map((issue, index) => (
                            <IssueCard key={index} issue={issue} />
                        ))
                    ) : (
                        <div className="empty-section-message">
                            No optimization tips found.
                        </div>
                    )}
                </CollapsibleSection>
            </div>

            <div className="footer-actions">
                <button 
                    className="download-button"
                    onClick={() => initiateDownload()}
                    title="Download comprehensive HTML report with all analysis results"
                >
                    Download Report
                </button>
            </div>
        </div>
    );
}; 