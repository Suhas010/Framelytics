import React from 'react';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';
import { useAnalyzer } from '../../hooks/useAnalyzer';

/**
 * Component for triggering a reanalysis of the current project
 */
export const ReanalyzeButton: React.FC = () => {
    const { analysisMode, isAnalyzing, resetResults } = useAnalysisContext();
    const { runAnalysis } = useAnalyzer();
    
    const config = ANALYSIS_CONFIG[analysisMode];
    
    const handleReanalyze = async () => {
        // Reset the current results first
        resetResults();
        
        // Run the analysis
        await runAnalysis();
    };
    
    // Reload icon for reanalyze button
    const ReloadIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px"}}>
            <path d="M1 4v6h6"></path>
            <path d="M23 20v-6h-6"></path>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
    );
    
    return (
        <button 
            className="reanalyze-button" 
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            style={{backgroundColor: config.primaryColor}}
        >
            {isAnalyzing ? (
                <>
                    <span className="loading-spinner"></span>
                    Analyzing {analysisMode.charAt(0).toUpperCase() + analysisMode.slice(1)}...
                </>
            ) : (
                <>
                    <ReloadIcon />
                    Reanalyze
                </>
            )}
        </button>
    );
}; 