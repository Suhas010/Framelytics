import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"
import "./App.css"
import { SEOAnalyzerService } from "./utils/seo-analyzer.service.fixed"
import { SEOAnalysisResult, SEOCategory, SEOIssue, SEOIssuePriority } from "./types/seo-types"
import { generateComprehensiveReport, downloadReport } from "./utils/report-generator"

framer.showUI({
    position: "top right",
    width: 400, // Increased for better display of content
    height: 700, // Increased for more content
})

function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

// Priority emoji map
const PRIORITY_EMOJI: Record<SEOIssuePriority, string> = {
    "critical": "🔴",
    "important": "🟡",
    "nice-to-have": "🔵"
};

// Analysis type color and info configuration
const ANALYSIS_CONFIG = {
    'seo': {
        primaryColor: '#0055FF',
        secondaryColor: '#E6F0FF',
        icon: '🔍',
        footerText: 'Based on Google Search Console best practices & SEO guidelines'
    },
    'accessibility': {
        primaryColor: '#9333EA',
        secondaryColor: '#F3E8FF',
        icon: '♿',
        footerText: 'Following WCAG 2.1 accessibility standards'
    },
    'links': {
        primaryColor: '#16A34A',
        secondaryColor: '#DCFCE7',
        icon: '🔗',
        footerText: 'Checks for broken links, redirects, and link integrity'
    }
};

// Project info interface
interface ProjectInfo {
    name: string;
    stageUrl: string;
    productionUrl: string;
    description: string;
    team: string;
}

// Component to display visual issue information
const VisualIssueDisplay = ({ issue }: { issue: SEOIssue }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Check if we have visual information
    const hasVisualInfo = issue.elementPosition || issue.screenshot;
    
    if (!hasVisualInfo) return null;
    
    // Handle image load success
    const handleImageLoad = () => {
        setImageLoaded(true);
    };
    
    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
        console.error("Failed to load screenshot for element:", issue.element);
    };
    
    return (
        <div className="issue-visual">
            {issue.screenshot && !imageError && (
                <div className="issue-screenshot">
                    <div className="screenshot-title">Element Screenshot:</div>
                    <img 
                        src={issue.screenshot} 
                        alt={`Screenshot of ${issue.element || 'element'}`}
                        width="100%"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                    {!imageLoaded && (
                        <div className="screenshot-loading">
                            Loading screenshot...
                        </div>
                    )}
                </div>
            )}
            
            {(issue.elementPosition && (!issue.screenshot || imageError)) && (
                <div className="issue-element-position">
                    <div className="position-title">Element Position:</div>
                    <div 
                        className="position-indicator"
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "100px",
                            border: "1px dashed #ccc",
                            borderRadius: "4px",
                            overflow: "hidden"
                        }}
                    >
                        <div 
                            style={{
                                position: "absolute",
                                left: `${issue.elementPosition.x / 10}%`,
                                top: `${issue.elementPosition.y / 10}%`,
                                width: `${issue.elementPosition.width / 5}px`,
                                height: `${issue.elementPosition.height / 5}px`,
                                backgroundColor: "rgba(255, 0, 0, 0.2)",
                                border: "1px solid rgba(255, 0, 0, 0.5)",
                                borderRadius: "2px"
                            }}
                        />
                        <div 
                            className="element-label"
                            style={{
                                position: "absolute",
                                left: "5px",
                                top: "5px",
                                fontSize: "10px",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                padding: "2px 4px",
                                borderRadius: "2px"
                            }}
                        >
                            {issue.element}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="issue-highlight-info">
                <button 
                    className="highlight-element-btn"
                    onClick={() => highlightElementInFramer(issue)}
                >
                    Highlight in Framer
                </button>
            </div>
        </div>
    );
};

// Function to highlight element in Framer
const highlightElementInFramer = (issue: SEOIssue) => {
    if (!issue.elementId) return;
    
    try {
        // In a real implementation, this would use Framer's API to:
        // 1. Select the element with the given ID
        // 2. Scroll to it
        // 3. Highlight it visually
        
        // For now, we'll just log that we want to highlight it
        console.log(`Highlighting element: ${issue.elementId}`);
        
        // Example of what this might look like with a real API:
        // framer.selectNode(issue.elementId);
        // framer.scrollToNode(issue.elementId);
        // framer.highlightNode(issue.elementId);
    } catch (error) {
        console.error("Failed to highlight element:", error);
    }
};

// Issue card component
const IssueCard = ({ issue, analyzeMode }: { issue: SEOIssue, analyzeMode: 'seo' | 'accessibility' | 'links' }) => {
    const [expanded, setExpanded] = useState(false);
    const config = ANALYSIS_CONFIG[analyzeMode];
    
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

// Collapsible section component
const CollapsibleSection = ({ 
    title, 
    issueCount, 
    children, 
    defaultExpanded = false 
}: { 
    title: string; 
    issueCount: number;
    children: React.ReactNode; 
    defaultExpanded?: boolean;
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    
    return (
        <div className="collapsible-section">
            <div 
                className="section-header" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2>
                    {title} 
                    <span className="issue-count">{issueCount}</span>
                </h2>
                <div className="section-toggle">{isExpanded ? '▼' : '▶'}</div>
            </div>
            
            {isExpanded && (
                <div className="section-content">
                    {children}
                </div>
            )}
        </div>
    );
};

// Project Info Form Component
const ProjectInfoForm = ({ 
    projectInfo, 
    setProjectInfo, 
    onSubmit, 
    onCancel,
    analyzeMode
}: { 
    projectInfo: ProjectInfo; 
    setProjectInfo: (info: ProjectInfo) => void;
    onSubmit: () => void;
    onCancel: () => void;
    analyzeMode: 'seo' | 'accessibility' | 'links';
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProjectInfo({
            ...projectInfo,
            [name]: value
        });
    };
    
    const config = ANALYSIS_CONFIG[analyzeMode];
    
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
                <button className="cancel-button" onClick={onCancel}>
                    Cancel
                </button>
                <button className="submit-button" onClick={onSubmit}>
                    Generate Report
                </button>
            </div>
        </div>
    );
};

// Analysis results component
const AnalysisResults = ({ 
    analysisResult, 
    selectedCategory, 
    setSelectedCategory, 
    analyzeMode,
    onDownloadReport
}: { 
    analysisResult: SEOAnalysisResult; 
    selectedCategory: SEOCategory | 'all';
    setSelectedCategory: (category: SEOCategory | 'all') => void;
    analyzeMode: 'seo' | 'accessibility' | 'links';
    onDownloadReport: () => void;
}) => {
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
    
    // Get CSS class for score
    const getScoreClass = (score: number) => {
        if (score >= 90) return "score-excellent";
        if (score >= 70) return "score-good";
        if (score >= 50) return "score-average";
        return "score-poor";
    };
    
    // Get categories with issues
    const getCategoriesWithIssues = () => {
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
        switch (analyzeMode) {
            case 'accessibility':
                return `${ANALYSIS_CONFIG.accessibility.icon} Accessibility Analysis`;
            case 'links':
                return `${ANALYSIS_CONFIG.links.icon} Broken Links Check`;
            default:
                return `${ANALYSIS_CONFIG.seo.icon} SEO Analysis`;
        }
    };
    
    const config = ANALYSIS_CONFIG[analyzeMode];

    return (
        <div className="results" style={{'--primary-color': config.primaryColor, '--secondary-color': config.secondaryColor} as React.CSSProperties}>
            <div className="info-banner">
                <p>{config.footerText}</p>
            </div>
            
            <h2 className="analysis-type-title">{getAnalysisTitle()}</h2>
            
            <div className="score-overview">
                <div className={`score ${getScoreClass(getScoreForDisplay())}`}>
                    {getScoreForDisplay()}
                </div>
                <div className="score-stats">
                    <div className="score-label">
                        {selectedCategory === 'all' ? 'Overall Score' : `${formatCategoryName(selectedCategory)} Score`}
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
            
            <div className="category-tabs">
                {getCategoriesWithIssues().map(category => (
                    <button 
                        key={category} 
                        className={selectedCategory === category ? 'active' : ''}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {formatCategoryName(category)}
                    </button>
                ))}
            </div>
            
            <div className="issues-container">
                {/* Critical Issues Section */}
                <CollapsibleSection 
                    title={`${PRIORITY_EMOJI.critical} Critical Issues`}
                    issueCount={getIssuesByPriority("critical").length}
                    defaultExpanded={getIssuesByPriority("critical").length > 0}
                >
                    {getIssuesByPriority("critical").length > 0 ? (
                        getIssuesByPriority("critical").map((issue, index) => (
                            <IssueCard key={index} issue={issue} analyzeMode={analyzeMode} />
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
                            <IssueCard key={index} issue={issue} analyzeMode={analyzeMode} />
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
                            <IssueCard key={index} issue={issue} analyzeMode={analyzeMode} />
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
                    onClick={onDownloadReport}
                    title="Download comprehensive HTML report"
                >
                    Download Report
                </button>
            </div>
        </div>
    );
};

export function App() {
    // Store analysis results for each mode separately
    const [seoResults, setSeoResults] = useState<SEOAnalysisResult | null>(null);
    const [accessibilityResults, setAccessibilityResults] = useState<SEOAnalysisResult | null>(null);
    const [linksResults, setLinksResults] = useState<SEOAnalysisResult | null>(null);
    
    // Store selected category for each mode separately
    const [seoCategory, setSeoCategory] = useState<SEOCategory | 'all'>('all');
    const [accessibilityCategory, setAccessibilityCategory] = useState<SEOCategory | 'all'>('all');
    const [linksCategory, setLinksCategory] = useState<SEOCategory | 'all'>('all');
    
    const [analyzeMode, setAnalyzeMode] = useState<'seo' | 'accessibility' | 'links'>('seo');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Project info states
    const [showProjectInfoForm, setShowProjectInfoForm] = useState(false);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
        name: '',
        stageUrl: '',
        productionUrl: '',
        description: '',
        team: ''
    });
    
    const selection = useSelection();
    const seoAnalyzer = new SEOAnalyzerService();
    
    // Get current results based on active tab
    const getCurrentResults = () => {
        switch (analyzeMode) {
            case 'accessibility':
                return accessibilityResults;
            case 'links':
                return linksResults;
            default:
                return seoResults;
        }
    };
    
    // Get current category based on active tab
    const getCurrentCategory = () => {
        switch (analyzeMode) {
            case 'accessibility':
                return accessibilityCategory;
            case 'links':
                return linksCategory;
            default:
                return seoCategory;
        }
    };
    
    // Set category for current mode
    const setCurrentCategory = (category: SEOCategory | 'all') => {
        switch (analyzeMode) {
            case 'accessibility':
                setAccessibilityCategory(category);
                break;
            case 'links':
                setLinksCategory(category);
                break;
            default:
                setSeoCategory(category);
                break;
        }
    };
    
    const runAnalysis = async () => {
        setIsAnalyzing(true);

        try {
            // Convert Framer selection to our node format
            const nodes = seoAnalyzer.createNodesFromFramerSelection(selection);
            
            // Set up filter based on current mode
            const filter = analyzeMode === 'seo' ? 
                ['metadata', 'structure', 'images', 'content', 'social'] :
                analyzeMode === 'accessibility' ? ['accessibility'] : 
                ['links'];
                
            const result = await seoAnalyzer.analyzeNodes(nodes, { filter });
            
            // Store results in appropriate state based on mode
            switch (analyzeMode) {
                case 'accessibility':
                    setAccessibilityResults(result);
                    break;
                case 'links':
                    setLinksResults(result);
                    break;
                default:
                    setSeoResults(result);
                    break;
            }
        } catch (error) {
            console.error(`Error analyzing ${analyzeMode}:`, error);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    // Show project info form before generating report
    const handleInitiateDownload = () => {
        setShowProjectInfoForm(true);
    };
    
    // Cancel project info form
    const handleCancelProjectInfo = () => {
        setShowProjectInfoForm(false);
    };
    
    // Generate and download comprehensive HTML report
    const handleDownloadReport = () => {
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
    
    const config = ANALYSIS_CONFIG[analyzeMode];

    return (
        <main className="seo-analyzer" style={{'--primary-color': config.primaryColor, '--secondary-color': config.secondaryColor} as React.CSSProperties}>
            <h1>Framer Analyzer</h1>
            
            {showProjectInfoForm ? (
                <ProjectInfoForm 
                    projectInfo={projectInfo}
                    setProjectInfo={setProjectInfo}
                    onSubmit={handleDownloadReport}
                    onCancel={handleCancelProjectInfo}
                    analyzeMode={analyzeMode}
                />
            ) : (
                <>
                    <div className="analysis-buttons">
                        <button 
                            className={`analysis-button ${analyzeMode === 'seo' ? 'active' : ''}`}
                            onClick={() => setAnalyzeMode('seo')}
                            disabled={isAnalyzing}
                            style={analyzeMode === 'seo' ? {backgroundColor: ANALYSIS_CONFIG.seo.primaryColor} : {}}
                        >
                            {ANALYSIS_CONFIG.seo.icon} SEO
                        </button>
                        <button 
                            className={`analysis-button ${analyzeMode === 'accessibility' ? 'active' : ''}`}
                            onClick={() => setAnalyzeMode('accessibility')}
                            disabled={isAnalyzing}
                            style={analyzeMode === 'accessibility' ? {backgroundColor: ANALYSIS_CONFIG.accessibility.primaryColor} : {}}
                        >
                            {ANALYSIS_CONFIG.accessibility.icon} Accessibility
                        </button>
                        <button 
                            className={`analysis-button ${analyzeMode === 'links' ? 'active' : ''}`}
                            onClick={() => setAnalyzeMode('links')}
                            disabled={isAnalyzing}
                            style={analyzeMode === 'links' ? {backgroundColor: ANALYSIS_CONFIG.links.primaryColor} : {}}
                        >
                            {ANALYSIS_CONFIG.links.icon} Links
                        </button>
                    </div>
                    
                    {!getCurrentResults() && (
                        <button 
                            className="framer-button-primary" 
                            onClick={runAnalysis}
                            disabled={isAnalyzing}
                            style={{backgroundColor: config.primaryColor}}
                        >
                            {isAnalyzing ? "Analyzing..." : `Analyze ${analyzeMode.charAt(0).toUpperCase() + analyzeMode.slice(1)}`}
                        </button>
                    )}
                    
                    {getCurrentResults() && (
                        <AnalysisResults 
                            analysisResult={getCurrentResults()!}
                            selectedCategory={getCurrentCategory()}
                            setSelectedCategory={setCurrentCategory}
                            analyzeMode={analyzeMode}
                            onDownloadReport={handleInitiateDownload}
                        />
                    )}
                    
                    <div className="footer">
                        <div className="made-with-love">
                            Made with <span className="heart">❤️</span> by <a href="https://github.com/suhas010" target="_blank" rel="noopener noreferrer">Suhas R More</a>
                        </div>
                    </div>
                </>
            )}
        </main>
    )
}
