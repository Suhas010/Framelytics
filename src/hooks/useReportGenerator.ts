import { useAnalysisContext } from '../context/AnalysisContext';
import { generateComprehensiveReport, downloadReport } from '../utils/report-generator';
import { useSelection } from './useSelection';

/**
 * Custom hook for generating and downloading reports
 */
export function useReportGenerator() {
    const {
        seoResults,
        accessibilityResults,
        linksResults,
        projectInfo,
        setShowProjectInfoForm
    } = useAnalysisContext();
    
    const selection = useSelection();
    
    /**
     * Show project info form before generating report
     */
    const initiateDownload = () => {
        setShowProjectInfoForm(true);
    };
    
    /**
     * Cancel project info form
     */
    const cancelProjectInfo = () => {
        setShowProjectInfoForm(false);
    };
    
    /**
     * Generate and download comprehensive HTML report
     */
    const generateAndDownloadReport = () => {
        // Get identifiers for analyzed frames
        const analyzedPages: string[] = [];
        
        // Add frame identifiers to the report
        if (selection && selection.length > 0) {
            // Just use the IDs of selected nodes
            selection.forEach((node, index) => {
                analyzedPages.push(`Selected frame ${index + 1}: ID ${node.id || 'unknown'}`);
            });
        }
        
        // Create a comprehensive report with all available analysis types
        const html = generateComprehensiveReport({
            seo: seoResults || undefined,
            accessibility: accessibilityResults || undefined,
            links: linksResults || undefined,
            generatedAt: new Date().toISOString(),
            projectInfo: {
                ...projectInfo,
                analyzedPages: analyzedPages.length > 0 ? analyzedPages : undefined
            }
        });
        
        // Use a standardized filename
        const filename = `framer-analysis-report-${new Date().toISOString().split('T')[0]}.html`;
        
        // Download the report
        downloadReport(html, filename, 'text/html');
        
        // Hide the project info form
        setShowProjectInfoForm(false);
    };
    
    return {
        initiateDownload,
        cancelProjectInfo,
        generateAndDownloadReport
    };
} 