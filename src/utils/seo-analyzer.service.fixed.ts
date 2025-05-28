import { Analyzer } from "../analyzers/analyzer.interface";
import { MetadataAnalyzer } from "../analyzers/metadata-analyzer";
import { ImagesAnalyzer } from "../analyzers/images-analyzer";
import { SocialAnalyzer } from "../analyzers/social-analyzer";
import { StructureAnalyzer } from "../analyzers/structure-analyzer";
import { FramerNode, SEOAnalysisResult, SEOCategory, SEOIssue, SEOAnalyzerOptions } from "../types/seo-types";
import { CanvasNode, framer } from "framer-plugin";
import html2canvas from 'html2canvas';
import { ContentAnalyzer } from "../analyzers/content-analyzer";
import { AccessibilityAnalyzer } from "../analyzers/accessibility-analyzer";
import { LinksAnalyzer } from "../analyzers/links-analyzer";

// Extended interface for type safety when working with Framer nodes
interface FramerExtendedNode extends CanvasNode {
    name: string;
    text?: string;
    type?: string;
    style?: {
        fontSize?: number;
        color?: string;
        backgroundColor?: string;
    };
    metadata?: {
        name?: string;
        content?: string;
        property?: string;
    };
}

// Define the type for exportImage options
interface ExportImageOptions {
    nodeId: string;
    format: string;
    scale: number;
    background: boolean;
    padding: number;
    maxWidth: number;
    [key: string]: any;
}

export class SEOAnalyzerService {
    private analyzers: Partial<Record<SEOCategory, Analyzer>> = {
        metadata: new MetadataAnalyzer(),
        structure: new StructureAnalyzer(),
        social: new SocialAnalyzer(),
        images: new ImagesAnalyzer(),
        content: new ContentAnalyzer(),
        accessibility: new AccessibilityAnalyzer(),
        links: new LinksAnalyzer()
    };
    
    async analyzeNodes(nodes: FramerNode[], options: SEOAnalyzerOptions = {}): Promise<SEOAnalysisResult> {
        const allIssues: SEOIssue[] = [];
        const categories: Record<SEOCategory, { issues: SEOIssue[], score: number }> = {
            metadata: { issues: [], score: 0 },
            headings: { issues: [], score: 0 },
            images: { issues: [], score: 0 },
            links: { issues: [], score: 0 },
            structure: { issues: [], score: 0 },
            content: { issues: [], score: 0 },
            performance: { issues: [], score: 0 },
            accessibility: { issues: [], score: 0 },
            mobile: { issues: [], score: 0 },
            social: { issues: [], score: 0 },
            security: { issues: [], score: 0 },
            favicon: { issues: [], score: 0 }
        };
        
        // Run all analyzers and collect issues
        for (const [category, analyzer] of Object.entries(this.analyzers)) {
            // Skip if filtered out
            if (options.filter && !options.filter.includes(category)) {
                continue;
            }
            
            if (analyzer) {
                const categoryIssues = analyzer.analyze(nodes);
                
                // Enrich issues with element positions and screenshots where possible
                const enrichedIssues = await this.enrichIssuesWithVisualInfo(categoryIssues, nodes);
                
                allIssues.push(...enrichedIssues);
                categories[category as SEOCategory].issues = enrichedIssues;
            }
        }
        
        // Calculate scores for each category
        for (const category of Object.keys(categories) as SEOCategory[]) {
            categories[category].score = this.calculateScoreForCategory(categories[category].issues);
        }
        
        // Calculate overall score
        const score = this.calculateOverallScore(categories);
        
        return {
            issues: allIssues,
            score,
            categories
        };
    }
    
    createNodesFromFramerSelection(selection: CanvasNode[]): FramerNode[] {
        // Convert Framer's CanvasNode to our internal FramerNode structure
        if (!selection || selection.length === 0) {
            // Return sample nodes for demonstration when nothing is selected
            return this.getSampleNodes();
        }
        
        // Map Framer selection to our FramerNode type
        const nodes: FramerNode[] = selection.map(node => this.convertCanvasNode(node));
        return nodes;
    }
    
    private convertCanvasNode(node: CanvasNode): FramerNode {
        // Cast to extended node for better type safety
        const extendedNode = node as unknown as FramerExtendedNode;
        
        // Create a FramerNode from a Framer CanvasNode
        return {
            id: extendedNode.id,
            name: extendedNode.name || "Unknown",
            text: extendedNode.text || "",
            type: extendedNode.type || "",
            style: {
                fontSize: extendedNode.style?.fontSize,
                color: extendedNode.style?.color,
                backgroundColor: extendedNode.style?.backgroundColor
            },
            metadata: extendedNode.metadata || {},
            // Additional properties would be extracted from the CanvasNode as needed
        };
    }
    
    private calculateScoreForCategory(issues: SEOIssue[]): number {
        if (issues.length === 0) return 100;
        
        // Calculate the score based on the number and severity of issues
        // Start with a perfect score and subtract points for each issue
        let score = 100;
        
        const criticalIssues = issues.filter(issue => issue.priority === "critical");
        const importantIssues = issues.filter(issue => issue.priority === "important");
        const niceToHaveIssues = issues.filter(issue => issue.priority === "nice-to-have");
        
        // Each critical issue subtracts 20 points
        score -= criticalIssues.length * 20;
        
        // Each important issue subtracts 10 points
        score -= importantIssues.length * 10;
        
        // Each nice-to-have issue subtracts 5 points
        score -= niceToHaveIssues.length * 5;
        
        // Ensure the score doesn't go below 0
        return Math.max(0, score);
    }
    
    private calculateOverallScore(categories: Record<SEOCategory, { issues: SEOIssue[], score: number }>): number {
        // Calculate the weighted average of all category scores
        const categoryWeights: Partial<Record<SEOCategory, number>> = {
            metadata: 1.5,
            headings: 1.2,
            structure: 1.2,
            links: 1.2,
            content: 1.2,
            images: 1,
            social: 1,
            accessibility: 1,
            mobile: 1,
            performance: 1,
            security: 0.8,
            favicon: 0.5
        };
        
        let totalWeight = 0;
        let weightedScore = 0;
        
        for (const [category, data] of Object.entries(categories)) {
            if (data.issues.length > 0) {
                const weight = categoryWeights[category as SEOCategory] || 1;
                totalWeight += weight;
                weightedScore += data.score * weight;
            }
        }
        
        return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 100;
    }
    
    // Enrich issues with visual information
    private async enrichIssuesWithVisualInfo(issues: SEOIssue[], nodes: FramerNode[]): Promise<SEOIssue[]> {
        const enrichedIssues: SEOIssue[] = [];
        
        for (const issue of issues) {
            // If the issue has an elementId, try to add position and screenshot
            if (issue.elementId) {
                const node = nodes.find(n => n.id === issue.elementId);
                
                if (node) {
                    // Add element position (simplified version)
                    issue.elementPosition = {
                        x: Math.random() * 100,  // Placeholder values
                        y: Math.random() * 100,
                        width: 100,
                        height: 50
                    };
                    
                    // Add screenshot (placeholder)
                    try {
                        // In a real implementation, this would capture a screenshot
                        // of the actual element using techniques like html2canvas
                        issue.screenshot = await this.getElementScreenshot(node);
                    } catch (error) {
                        console.error("Failed to capture screenshot:", error);
                    }
                }
            }
            
            enrichedIssues.push(issue);
        }
        
        return enrichedIssues;
    }
    
    // Placeholder for getting element screenshot
    private async getElementScreenshot(_node: FramerNode): Promise<string> {
        // In a real implementation, this would capture an actual screenshot
        // using techniques like html2canvas or the Framer API
        
        // For demonstration, return a blank image
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICAYAAABS39xVAAAABmJLR0QA/wD/AP+gvaeTAAAAPUlEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALD64QBQjQIO4gAAAABJRU5ErkJggg==';
    }
    
    // For demonstration purposes, create sample nodes
    private getSampleNodes(): FramerNode[] {
        return [
            {
                id: "title",
                name: "title",
                text: "Welcome to our website",
                type: "text",
                style: {
                    fontSize: 32
                }
            },
            {
                id: "meta-description",
                name: "meta-description",
                metadata: {
                    name: "description",
                    content: "This is a sample meta description for demonstration purposes."
                }
            },
            {
                id: "hero-image",
                name: "hero-image",
                type: "image",
                alt: "Hero image"
            },
            {
                id: "heading1",
                name: "h1",
                text: "Main Heading",
                type: "text",
                style: {
                    fontSize: 24
                }
            },
            {
                id: "paragraph1",
                name: "paragraph",
                text: "This is a sample paragraph with some content for the SEO analyzer to evaluate.",
                type: "text"
            }
        ];
    }
} 