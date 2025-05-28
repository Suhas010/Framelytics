import React from 'react';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';

/**
 * Component for rendering analysis mode tabs (SEO, Accessibility, Links)
 */
export const AnalysisTabs: React.FC = () => {
    const { analysisMode, setAnalysisMode, isAnalyzing } = useAnalysisContext();
    
    return (
        <div className="analysis-buttons">
            <button 
                className={`analysis-button ${analysisMode === 'seo' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('seo')}
                disabled={isAnalyzing}
                style={analysisMode === 'seo' ? {backgroundColor: ANALYSIS_CONFIG.seo.primaryColor} : {}}
            >
                {ANALYSIS_CONFIG.seo.icon} SEO
            </button>
            <button 
                className={`analysis-button ${analysisMode === 'accessibility' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('accessibility')}
                disabled={isAnalyzing}
                style={analysisMode === 'accessibility' ? {backgroundColor: ANALYSIS_CONFIG.accessibility.primaryColor} : {}}
            >
                {ANALYSIS_CONFIG.accessibility.icon} Accessibility
            </button>
            <button 
                className={`analysis-button ${analysisMode === 'links' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('links')}
                disabled={isAnalyzing}
                style={analysisMode === 'links' ? {backgroundColor: ANALYSIS_CONFIG.links.primaryColor} : {}}
            >
                {ANALYSIS_CONFIG.links.icon} Links
            </button>
        </div>
    );
}; 