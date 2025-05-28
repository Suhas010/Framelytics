import { Analyzer } from "../analyzers/analyzer.interface";
import { MetadataAnalyzer } from "../analyzers/metadata-analyzer";
import { ImagesAnalyzer } from "../analyzers/images-analyzer";
import { SocialAnalyzer } from "../analyzers/social-analyzer";
import { FramerNode, SEOAnalysisResult, SEOCategory, SEOIssue } from "../types/seo-types";

export class SEOAnalyzerService {
    private analyzers: Analyzer[] = [];
    
    constructor() {
        // Register all analyzers
        this.registerAnalyzer(new MetadataAnalyzer());
        this.registerAnalyzer(new ImagesAnalyzer());
        this.registerAnalyzer(new SocialAnalyzer());
        // Add more analyzers as they're created
    }
    
    registerAnalyzer(analyzer: Analyzer): void {
        this.analyzers.push(analyzer);
    }
    
    async analyzeNodes(nodes: FramerNode[]): Promise<SEOAnalysisResult> {
        const allIssues: SEOIssue[] = [];
        const categoryIssues: Record<SEOCategory, SEOIssue[]> = {
            metadata: [],
            headings: [],
            images: [],
            links: [],
            structure: [],
            content: [],
            performance: [],
            accessibility: [],
            mobile: [],
            social: [],
            security: [],
            favicon: []
        };
        
        // Run all analyzers
        for (const analyzer of this.analyzers) {
            const issues = analyzer.analyze(nodes);
            allIssues.push(...issues);
            
            // Group issues by category
            issues.forEach(issue => {
                categoryIssues[issue.category].push(issue);
            });
        }
        
        // Calculate scores for each category
        const categoryScores: Record<SEOCategory, { issues: SEOIssue[], score: number }> = 
            Object.entries(categoryIssues).reduce((acc, [category, issues]) => {
                const errorCount = issues.filter(issue => issue.type === "error").length;
                const warningCount = issues.filter(issue => issue.type === "warning").length;
                
                // Calculate score (100 - deductions)
                // Each error reduces score by 25, each warning by 10 (but never below 0)
                let score = 100 - (errorCount * 25) - (warningCount * 10);
                score = Math.max(0, score);
                
                acc[category as SEOCategory] = {
                    issues,
                    score
                };
                
                return acc;
            }, {} as Record<SEOCategory, { issues: SEOIssue[], score: number }>);
        
        // Calculate overall score (average of category scores)
        const activeCategories = Object.values(categoryScores).filter(
            category => category.issues.length > 0
        );
        
        const totalScore = activeCategories.reduce(
            (sum, category) => sum + category.score, 
            0
        );
        
        const overallScore = activeCategories.length > 0
            ? Math.round(totalScore / activeCategories.length)
            : 100;
        
        return {
            issues: allIssues,
            score: overallScore,
            categories: categoryScores
        };
    }
    
    // Helper method to extract mock nodes from Framer
    createNodesFromFramerSelection(selection: any[]): FramerNode[] {
        // In a real implementation, this would convert Framer's selection into our FramerNode type
        // For now, this is just a placeholder that would need to be implemented based on Framer's API
        
        if (!selection || selection.length === 0) {
            // Return sample nodes for demonstration when nothing is selected
            return this.getSampleNodes();
        }
        
        // Map Framer selection to our FramerNode type
        return selection.map(node => ({
            id: node.id,
            name: node.name || "Unknown",
            text: node.text || "",
            type: node.type || "",
            alt: node.alt || node.altText || "",
            href: node.href || "",
            rel: node.rel || "",
            style: {
                fontSize: node.style?.fontSize || 0,
                width: node.width || 0,
                height: node.height || 0
            },
            children: []
        }));
    }
    
    // For demonstration purposes, create sample nodes
    private getSampleNodes(): FramerNode[] {
        return [
            {
                id: "title1",
                name: "Title",
                text: "Welcome to our Website",
                type: "text",
                style: { fontSize: 36 }
            },
            {
                id: "meta-desc",
                name: "Description",
                text: "This is a sample description for the website that appears in search results.",
                type: "text",
                metadata: {
                    name: "description",
                    content: "This is a sample description for the website that appears in search results."
                }
            },
            {
                id: "img1",
                name: "logo-image",
                type: "image",
                alt: ""
            },
            {
                id: "img2",
                name: "hero-image",
                type: "image",
                alt: "A beautiful mountain landscape"
            }
        ];
    }
} 