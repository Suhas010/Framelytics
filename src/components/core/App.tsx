import React from 'react';
import { framer } from 'framer-plugin';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';
import { AnalysisTabs } from './AnalysisTabs';
import { AnalyzeButton } from './AnalyzeButton';
import { AnalysisResults } from '../analysis/AnalysisResults';
import { Footer } from '../layout/Footer';
import { ReanalyzeButton } from './ReanalyzeButton';
import { useReportGenerator } from '../../hooks/useReportGenerator';

// Configure Framer UI
framer.showUI({
    position: "top right",
    width: 400,
    height: 700,
});

/**
 * Main application component
 */
export const App: React.FC = () => {
    const { 
        getCurrentResults,
        analysisMode,
        isAnalyzing
    } = useAnalysisContext();
    
    const { initiateDownload } = useReportGenerator();
    
    const hasResults = !!getCurrentResults();
    
    return (
        <main className="seo-analyzer" style={{'--primary-color': ANALYSIS_CONFIG[analysisMode].primaryColor, '--secondary-color': ANALYSIS_CONFIG[analysisMode].secondaryColor} as React.CSSProperties}>
            <h1>Framelytics</h1>
            
            <AnalysisTabs />
            
            {!hasResults && !isAnalyzing && (
                <AnalyzeButton />
            )}
            
            {hasResults && (
                <AnalysisResults />
            )}
            
            {/* Action buttons at the bottom of UI */}
            {hasResults && (
                <div className="bottom-actions">
                    <ReanalyzeButton />
                    
                    <div 
                        className="download-button"
                        onClick={() => initiateDownload()}
                    >
                        Download Report
                    </div>
                </div>
            )}
            
            <Footer />
        </main>
    );
}; 