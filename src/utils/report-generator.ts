import { SEOAnalysisResult, SEOIssue, SEOIssuePriority, SEOCategory } from "../types/seo-types";

// Priority emoji map for reports
const PRIORITY_EMOJI: Record<SEOIssuePriority, string> = {
    "critical": "🔴",
    "important": "🟡",
    "nice-to-have": "🔵"
};

interface ProjectInfo {
    name?: string;
    stageUrl?: string;
    productionUrl?: string;
    description?: string;
    team?: string;
    analyzedPages?: string[];
}

interface ComprehensiveReport {
    seo?: SEOAnalysisResult;
    accessibility?: SEOAnalysisResult;
    links?: SEOAnalysisResult;
    generatedAt: string;
    projectInfo?: ProjectInfo;
}

export function generateHtmlReport(analysisResult: SEOAnalysisResult): string {
    return generateComprehensiveReport({ 
        seo: analysisResult,
        generatedAt: new Date().toISOString()
    });
}

export function generateComprehensiveReport(report: ComprehensiveReport): string {
    // Get report data
    const { seo, accessibility, links, generatedAt, projectInfo } = report;
    const dateFormatted = new Date(generatedAt).toLocaleString();
    
    // Prepare CSS styles for the report
    const styles = `
        :root {
            --primary-color: #0055FF;
            --critical-color: #EF4444;
            --important-color: #F59E0B;
            --nice-to-have-color: #3B82F6;
            --success-color: #22C55E;
            --background-color: #f5f5f7;
            --card-bg-color: #ffffff;
            --text-color: #333333;
            --text-light-color: #666666;
            --border-color: #eeeeee;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.5;
            color: var(--text-color);
            background-color: var(--background-color);
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            margin-bottom: 30px;
            text-align: center;
            padding: 20px;
            background-color: var(--card-bg-color);
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        h2 {
            color: var(--primary-color);
            margin: 25px 0 15px 0;
            font-size: 22px;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 8px;
        }
        
        h3 {
            margin: 20px 0 10px 0;
            font-size: 18px;
        }
        
        h4 {
            margin: 15px 0 10px 0;
            font-size: 16px;
            color: var(--text-color);
        }
        
        .report-meta {
            color: var(--text-light-color);
            font-size: 14px;
            margin-top: 10px;
        }
        
        .project-info {
            background-color: var(--card-bg-color);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .project-info h2 {
            margin-top: 0;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .project-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .project-info-item {
            margin-bottom: 10px;
        }
        
        .project-info-label {
            font-weight: 500;
            margin-bottom: 5px;
            color: var(--text-light-color);
        }
        
        .project-info-value {
            word-break: break-word;
        }
        
        .project-info-value a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .project-info-value a:hover {
            text-decoration: underline;
        }
        
        .report-summary {
            margin-bottom: 30px;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
        }
        
        .score-card {
            background-color: var(--card-bg-color);
            border-radius: 8px;
            padding: 20px;
            min-width: 250px;
            flex: 1;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .score-card h3 {
            margin-top: 0;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .score {
            font-size: 42px;
            font-weight: bold;
            margin: 10px 0;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px auto;
            color: white;
        }
        
        .score-excellent {
            background-color: #22C55E;
        }
        
        .score-good {
            background-color: #3B82F6;
        }
        
        .score-average {
            background-color: #F59E0B;
        }
        
        .score-poor {
            background-color: #EF4444;
        }
        
        .score-summary {
            font-size: 14px;
            color: var(--text-light-color);
            margin-top: 10px;
        }
        
        .categories-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .category-badge {
            background-color: #f0f0f0;
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 12px;
            white-space: nowrap;
        }
        
        .section {
            background-color: var(--card-bg-color);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .issue-list {
            margin-top: 15px;
        }
        
        .issue-card {
            border: 1px solid var(--border-color);
            border-radius: 6px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        
        .issue-card.error {
            border-left: 4px solid var(--critical-color);
        }
        
        .issue-card.warning {
            border-left: 4px solid var(--important-color);
        }
        
        .issue-card.info {
            border-left: 4px solid var(--nice-to-have-color);
        }
        
        .issue-card.success {
            border-left: 4px solid var(--success-color);
        }
        
        .issue-header {
            padding: 12px 15px;
            background-color: #fcfcfc;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
        }
        
        .issue-icon {
            margin-right: 10px;
            font-size: 18px;
        }
        
        .issue-title {
            font-weight: 500;
            flex-grow: 1;
        }
        
        .issue-priority {
            font-size: 12px;
            color: var(--text-light-color);
            background-color: #f0f0f0;
            padding: 3px 8px;
            border-radius: 12px;
        }
        
        .issue-details {
            padding: 15px;
            font-size: 14px;
        }
        
        .issue-recommendation {
            margin-bottom: 10px;
        }
        
        .issue-element {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f5f5f7;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
        }
        
        .issue-resource {
            margin-top: 10px;
        }
        
        .issue-resource a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .issue-resource a:hover {
            text-decoration: underline;
        }
        
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
        }
        
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            font-weight: 500;
        }
        
        .tab.active {
            border-bottom-color: var(--primary-color);
            color: var(--primary-color);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid var(--border-color);
            color: var(--text-light-color);
            font-size: 14px;
        }
        
        .chart {
            width: 100%;
            height: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
            margin: 10px 0;
            overflow: hidden;
        }
        
        .chart-bar {
            height: 100%;
            background-color: var(--primary-color);
        }
        
        .analyzed-pages {
            margin-top: 15px;
        }
        
        .analyzed-pages-list {
            list-style-type: none;
            padding-left: 0;
            margin-top: 5px;
        }
        
        .analyzed-pages-list li {
            padding: 5px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .analyzed-pages-list li:last-child {
            border-bottom: none;
        }
        
        @media print {
            body {
                background-color: white;
                color: black;
            }
            
            .score-card, .section, .project-info {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #ddd;
            }
            
            .tab {
                border-bottom-color: transparent !important;
            }
            
            .tab-content {
                display: block !important;
            }
        }
        
        @media (max-width: 768px) {
            .report-summary {
                flex-direction: column;
            }
            
            .score-card {
                min-width: 100%;
            }
            
            .project-info-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    // JavaScript for tab functionality
    const script = `
        document.addEventListener('DOMContentLoaded', function() {
            // Tab functionality
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs and contents
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to current tab and content
                    tab.classList.add('active');
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
        });
    `;
    
    // Generate score class based on value
    const getScoreClass = (score: number) => {
        if (score >= 90) return "score-excellent";
        if (score >= 70) return "score-good";
        if (score >= 50) return "score-average";
        return "score-poor";
    };
    
    // Generate project info section
    const generateProjectInfoSection = () => {
        if (!projectInfo) return '';
        
        const { name, stageUrl, productionUrl, description, team, analyzedPages } = projectInfo;
        
        return `
            <div class="project-info">
                <h2>Project Information</h2>
                <div class="project-info-grid">
                    ${name ? `
                        <div class="project-info-item">
                            <div class="project-info-label">Project Name</div>
                            <div class="project-info-value">${name}</div>
                        </div>
                    ` : ''}
                    
                    ${team ? `
                        <div class="project-info-item">
                            <div class="project-info-label">Team</div>
                            <div class="project-info-value">${team}</div>
                        </div>
                    ` : ''}
                    
                    ${stageUrl ? `
                        <div class="project-info-item">
                            <div class="project-info-label">Stage URL</div>
                            <div class="project-info-value">
                                <a href="${stageUrl}" target="_blank" rel="noopener noreferrer">${stageUrl}</a>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${productionUrl ? `
                        <div class="project-info-item">
                            <div class="project-info-label">Production URL</div>
                            <div class="project-info-value">
                                <a href="${productionUrl}" target="_blank" rel="noopener noreferrer">${productionUrl}</a>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${description ? `
                    <div class="project-info-item" style="margin-top: 15px;">
                        <div class="project-info-label">Description</div>
                        <div class="project-info-value">${description}</div>
                    </div>
                ` : ''}
                
                ${analyzedPages && analyzedPages.length > 0 ? `
                    <div class="analyzed-pages">
                        <div class="project-info-label">Analyzed Pages (${analyzedPages.length})</div>
                        <ul class="analyzed-pages-list">
                            ${analyzedPages.map(page => `
                                <li>${page}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    };
    
    // Generate analysis section
    const generateAnalysisSection = (result: SEOAnalysisResult | undefined, title: string, tabId: string, isActive = false) => {
        if (!result) return '';
        
        // Get critical, important, and nice-to-have issues
        const criticalIssues = result.issues.filter(issue => issue.priority === "critical");
        const importantIssues = result.issues.filter(issue => issue.priority === "important");
        const niceToHaveIssues = result.issues.filter(issue => issue.priority === "nice-to-have");
        
        // Get categories with issues
        const categoriesWithIssues = Object.entries(result.categories)
            .filter(([, categoryData]) => categoryData.issues.length > 0)
            .map(([category]) => category as SEOCategory);
            
        // Format category name
        const formatCategoryName = (category: SEOCategory) => {
            return category.charAt(0).toUpperCase() + category.slice(1);
        };
        
        // Generate issues list by priority
        const generateIssuesList = (issues: SEOIssue[]) => {
            if (issues.length === 0) {
                return '<p>No issues found. Great job!</p>';
            }
            
            return issues.map(issue => `
                <div class="issue-card ${issue.type}">
                    <div class="issue-header">
                        <div class="issue-icon">
                            ${issue.type === "error" ? "❌" : 
                              issue.type === "warning" ? "⚠️" : 
                              issue.type === "success" ? "✅" : "ℹ️"}
                        </div>
                        <div class="issue-title">${issue.message}</div>
                        <div class="issue-priority">${PRIORITY_EMOJI[issue.priority]} ${issue.priority}</div>
                    </div>
                    <div class="issue-details">
                        ${issue.recommendation ? `
                            <div class="issue-recommendation">
                                <strong>Recommendation:</strong> ${issue.recommendation}
                            </div>
                        ` : ''}
                        ${issue.element ? `
                            <div class="issue-element">
                                <strong>Element:</strong> ${issue.element}
                            </div>
                        ` : ''}
                        ${issue.externalResourceLink ? `
                            <div class="issue-resource">
                                <strong>Learn more:</strong> <a href="${issue.externalResourceLink}" target="_blank" rel="noopener noreferrer">${issue.externalResourceTitle || "External resource"}</a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        };
        
        return `
            <div id="${tabId}" class="tab-content ${isActive ? 'active' : ''}">
                <div class="section">
                    <h2>${title}</h2>
                    <div class="score-card">
                        <h3>Overall Score</h3>
                        <div class="score ${getScoreClass(result.score)}">${result.score}</div>
                        <div class="score-summary">
                            <p>${criticalIssues.length} critical, ${importantIssues.length} important, and ${niceToHaveIssues.length} nice-to-have issues found.</p>
                        </div>
                        <div class="categories-summary">
                            ${categoriesWithIssues.map(category => `
                                <span class="category-badge">${formatCategoryName(category)}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${criticalIssues.length > 0 ? `
                        <div class="issue-section">
                            <h3>${PRIORITY_EMOJI.critical} Critical Issues (${criticalIssues.length})</h3>
                            <div class="issue-list">
                                ${generateIssuesList(criticalIssues)}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${importantIssues.length > 0 ? `
                        <div class="issue-section">
                            <h3>${PRIORITY_EMOJI.important} Important Issues (${importantIssues.length})</h3>
                            <div class="issue-list">
                                ${generateIssuesList(importantIssues)}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${niceToHaveIssues.length > 0 ? `
                        <div class="issue-section">
                            <h3>${PRIORITY_EMOJI["nice-to-have"]} Optimization Tips (${niceToHaveIssues.length})</h3>
                            <div class="issue-list">
                                ${generateIssuesList(niceToHaveIssues)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    };
    
    // Generate HTML report
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Framer Analysis Report</title>
            <style>${styles}</style>
        </head>
        <body>
            <header>
                <h1>Framer Analysis Report</h1>
                <p class="report-meta">Generated on ${dateFormatted}</p>
            </header>
            
            ${generateProjectInfoSection()}
            
            <div class="report-summary">
                ${seo ? `
                    <div class="score-card">
                        <h3>SEO Score</h3>
                        <div class="score ${getScoreClass(seo.score)}">${seo.score}</div>
                        <p class="score-summary">${seo.issues.length} issues found</p>
                    </div>
                ` : ''}
                
                ${accessibility ? `
                    <div class="score-card">
                        <h3>Accessibility Score</h3>
                        <div class="score ${getScoreClass(accessibility.score)}">${accessibility.score}</div>
                        <p class="score-summary">${accessibility.issues.length} issues found</p>
                    </div>
                ` : ''}
                
                ${links ? `
                    <div class="score-card">
                        <h3>Links Score</h3>
                        <div class="score ${getScoreClass(links.score)}">${links.score}</div>
                        <p class="score-summary">${links.issues.length} issues found</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="tabs">
                ${seo ? `<div class="tab active" data-tab="seo-tab">SEO Analysis</div>` : ''}
                ${accessibility ? `<div class="tab ${!seo ? 'active' : ''}" data-tab="accessibility-tab">Accessibility Analysis</div>` : ''}
                ${links ? `<div class="tab ${!seo && !accessibility ? 'active' : ''}" data-tab="links-tab">Broken Links Check</div>` : ''}
            </div>
            
            ${generateAnalysisSection(seo, 'SEO Analysis', 'seo-tab', true)}
            ${generateAnalysisSection(accessibility, 'Accessibility Analysis', 'accessibility-tab')}
            ${generateAnalysisSection(links, 'Broken Links Check', 'links-tab')}
            
            <footer>
                <p>This report was generated by Framer SEO Analyzer.</p>
                <p>The recommendations are based on SEO best practices from Google, Moz, and other authoritative sources.</p>
            </footer>
            
            <script>${script}</script>
        </body>
        </html>
    `;
}

/**
 * Generates a plain text report from SEO analysis results
 */
export function generateTextReport(result: SEOAnalysisResult): string {
    const date = new Date().toLocaleString();
    
    let report = `SEO ANALYSIS REPORT\n`;
    report += `Generated on: ${date}\n`;
    report += `Overall Score: ${result.score}/100\n\n`;
    
    // Issue counts
    const criticalCount = result.issues.filter(issue => issue.priority === 'critical').length;
    const importantCount = result.issues.filter(issue => issue.priority === 'important').length;
    const niceToHaveCount = result.issues.filter(issue => issue.priority === 'nice-to-have').length;
    
    report += `SUMMARY:\n`;
    report += `- Critical issues: ${criticalCount}\n`;
    report += `- Important issues: ${importantCount}\n`;
    report += `- Optimization tips: ${niceToHaveCount}\n\n`;
    
    // Group issues by category
    const categoriesWithIssues = Object.entries(result.categories)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_category, categoryData]) => categoryData.issues.length > 0)
        .map(([category, data]) => ({
            name: category as SEOCategory,
            score: data.score,
            issues: data.issues
        }))
        .sort((a, b) => a.score - b.score); // Sort by score ascending (worst first)
    
    // Add each category and its issues
    categoriesWithIssues.forEach(category => {
        report += `${formatCategoryName(category.name).toUpperCase()} (Score: ${category.score}/100)\n`;
        report += `${'='.repeat(formatCategoryName(category.name).length + 14)}\n\n`;
        
        category.issues.forEach(issue => {
            const issueType = issue.type === 'error' ? '[ERROR]' : 
                             issue.type === 'warning' ? '[WARNING]' : '[INFO]';
            
            report += `${issueType} ${issue.message}\n`;
            
            if (issue.element) {
                report += `Element: ${issue.element}\n`;
            }
            
            if (issue.recommendation) {
                report += `Recommendation: ${issue.recommendation}\n`;
            }
            
            if (issue.externalResourceLink) {
                report += `Learn more: ${issue.externalResourceTitle || issue.externalResourceLink}\n`;
            }
            
            report += `\n`;
        });
        
        report += `\n`;
    });
    
    return report;
}

/**
 * Formats a category name for display
 */
function formatCategoryName(category: SEOCategory): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Triggers a download of the provided content as a file
 */
export function downloadReport(content: string, filename: string, contentType: string): void {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(a.href);
} 