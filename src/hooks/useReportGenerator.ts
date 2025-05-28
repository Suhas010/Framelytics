import { useAnalysisContext } from '../context/AnalysisContext';
import { generateComprehensiveReport, downloadReport } from '../utils/report-generator';
import { useSelection } from './useSelection';
import { usePublishInfo } from './usePublishInfo';
import { SEOAnalyzerService } from '../utils/seo-analyzer.service.fixed';
import { SEOCategory } from '../types/seo-types';

/**
 * Custom hook for generating and downloading reports
 */
export function useReportGenerator() {
    const {
        seoResults,
        accessibilityResults,
        linksResults,
        setProjectInfo,
        setShowProjectInfoForm,
        setSeoResults,
        setAccessibilityResults,
        setLinksResults
    } = useAnalysisContext();
    
    const selection = useSelection();
    const publishInfo = usePublishInfo();
    
    /**
     * Get project URLs from Framer
     */
    const getProjectUrls = () => {
        // Extract URLs from publish info
        const stagingUrl = publishInfo?.staging?.currentPageUrl || "";
        const productionUrl = publishInfo?.published?.currentPageUrl || "";
        const projectName = publishInfo?.site?.title || "Framer Project";
        
        // Create project info with URLs
        const urlInfo = {
            name: projectName,
            stageUrl: stagingUrl,
            productionUrl: productionUrl,
            // Keep these empty to simplify the report
            description: "",
            team: ""
        };
        
        // Update context
        setProjectInfo(urlInfo);
        return urlInfo;
    };
    
    /**
     * Run analysis for any missing categories
     */
    const ensureAllCategoriesAnalyzed = async () => {
        const seoAnalyzer = new SEOAnalyzerService();
        const nodes = seoAnalyzer.createNodesFromFramerSelection(selection);
        
        // Run SEO analysis if needed
        if (!seoResults) {
            const filter: SEOCategory[] = ['metadata', 'structure', 'images', 'content', 'social'];
            const result = await seoAnalyzer.analyzeNodes(nodes, { filter });
            setSeoResults(result);
        }
        
        // Run Accessibility analysis if needed
        if (!accessibilityResults) {
            const filter: SEOCategory[] = ['accessibility'];
            const result = await seoAnalyzer.analyzeNodes(nodes, { filter });
            setAccessibilityResults(result);
        }
        
        // Run Links analysis if needed
        if (!linksResults) {
            const filter: SEOCategory[] = ['links'];
            const result = await seoAnalyzer.analyzeNodes(nodes, { filter });
            setLinksResults(result);
        }
    };
    
    /**
     * Initiate report download process
     */
    const initiateDownload = async () => {
        // Check if we have staging or production URL
        if (!publishInfo?.staging?.currentPageUrl && !publishInfo?.published?.currentPageUrl) {
            // Could show an alert or message here if URLs are missing
            console.warn("No staging or production URL available. Please publish your site.");
        }
        
        // Ensure all categories are analyzed
        await ensureAllCategoriesAnalyzed();
        
        // Generate and download the report
        generateAndDownloadReport();
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
        // Get project URLs from Framer
        const urlInfo = getProjectUrls();
        
        // Get identifiers for analyzed frames
        const analyzedPages: string[] = [];
        
        // Add frame identifiers to the report
        if (selection && selection.length > 0) {
            // Use the IDs of selected nodes
            selection.forEach((node, index) => {
                // Safely access node properties
                const nodeLabel = typeof node.id === 'string' ? node.id : 'unknown';
                
                // Use a generic name since we can't reliably access the name property
                const nodeName = "Frame";
                
                analyzedPages.push(`${nodeName} ${index + 1} (ID: ${nodeLabel})`);
            });
        }
        
        // Create a comprehensive report with all available analysis types
        const html = generateComprehensiveReport({
            seo: seoResults || undefined,
            accessibility: accessibilityResults || undefined,
            links: linksResults || undefined,
            generatedAt: new Date().toISOString(),
            projectInfo: {
                ...urlInfo,
                analyzedPages: analyzedPages.length > 0 ? analyzedPages : undefined
            }
        });
        
        // Use a standardized filename with project name if available
        const projectNameSlug = urlInfo.name ? 
            urlInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'framer';
        const filename = `${projectNameSlug}-analysis-report-${new Date().toISOString().split('T')[0]}.html`;
        
        // Download the report
        downloadReport(html, filename, 'text/html');
        
        // Hide the project info form if it was showing
        setShowProjectInfoForm(false);
    };
    
    return {
        initiateDownload,
        cancelProjectInfo,
        generateAndDownloadReport
    };
} 