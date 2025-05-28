import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class StructureAnalyzer implements Analyzer {
    category: SEOCategory = "structure";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for heading structure
        this.checkHeadingStructure(nodes, issues);
        
        // Check for semantic HTML elements
        this.checkSemanticElements(nodes, issues);
        
        // Check for content structure
        this.checkContentStructure(nodes, issues);
        
        return issues;
    }
    
    private checkHeadingStructure(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all heading nodes
        const h1Nodes = nodes.filter(node => 
            node.name.toLowerCase() === "h1" || 
            node.name.toLowerCase() === "heading1" ||
            node.name.toLowerCase().includes("h1") ||
            node.name.toLowerCase().includes("title") ||
            (node.style?.fontSize && node.style.fontSize >= 32));
            
        const h2Nodes = nodes.filter(node => 
            node.name.toLowerCase() === "h2" || 
            node.name.toLowerCase() === "heading2" ||
            node.name.toLowerCase().includes("h2") ||
            node.name.toLowerCase().includes("subtitle") ||
            (node.style?.fontSize && node.style.fontSize >= 24 && node.style.fontSize < 32));
        
        // Check for exactly one H1 heading
        if (h1Nodes.length === 0) {
            issues.push({
                type: "error",
                message: "No H1 heading found on the page",
                category: this.category,
                recommendation: "Add an H1 heading as the main title of your page - each page should have exactly one H1",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/docs/appearance/page-titles",
                externalResourceTitle: "Google: Create good page titles"
            });
        } else if (h1Nodes.length > 1) {
            // List all nodes that might be H1s
            let h1NodesList = "";
            h1Nodes.forEach((node, index) => {
                if (index < 5) { // Limit to 5 to avoid overwhelming the report
                    h1NodesList += `• "${node.text || node.name}"\n`;
                }
            });
            
            if (h1Nodes.length > 5) {
                h1NodesList += `• ... and ${h1Nodes.length - 5} more`;
            }
            
            issues.push({
                type: "error",
                message: `Multiple H1 headings found (${h1Nodes.length})`,
                category: this.category,
                recommendation: "Use only one H1 heading per page for proper SEO structure. The following elements are detected as H1s:\n" + h1NodesList,
                priority: "critical",
                externalResourceLink: "https://www.searchenginejournal.com/on-page-seo/heading-tags/",
                externalResourceTitle: "How to Use Heading Tags for SEO"
            });
            
            // Find the most appropriate H1
            const potentialMainH1 = this.findMainH1(h1Nodes);
            if (potentialMainH1) {
                issues.push({
                    type: "info",
                    message: `Consider keeping "${potentialMainH1.text || potentialMainH1.name}" as your main H1`,
                    category: this.category,
                    element: potentialMainH1.name,
                    elementId: potentialMainH1.id,
                    recommendation: "Keep this as your main H1 and convert other H1s to H2s or other elements",
                    priority: "important"
                });
            }
        }
        
        // Check for heading hierarchy
        if (h1Nodes.length === 0 && h2Nodes.length > 0) {
            issues.push({
                type: "warning",
                message: "H2 headings found without an H1 heading",
                category: this.category,
                recommendation: "Add an H1 heading before using H2 headings - proper heading hierarchy is important for SEO",
                priority: "important",
                externalResourceLink: "https://www.w3.org/WAI/tutorials/page-structure/headings/",
                externalResourceTitle: "W3C: Headings"
            });
        }
        
        // Check heading contents
        h1Nodes.forEach(node => {
            const headingText = node.text || "";
            if (headingText.length < 20) {
                issues.push({
                    type: "info",
                    message: "H1 heading is quite short",
                    category: this.category,
                    element: "h1",
                    elementId: node.id,
                    recommendation: "Consider using a more descriptive H1 heading that includes your main keyword",
                    priority: "important",
                    externalResourceLink: "https://moz.com/learn/seo/on-page-factors",
                    externalResourceTitle: "Moz: On-Page Ranking Factors"
                });
            }
            
            if (headingText.length > 70) {
                issues.push({
                    type: "warning",
                    message: "H1 heading is too long",
                    category: this.category,
                    element: "h1",
                    elementId: node.id,
                    recommendation: "Keep H1 headings concise (under 70 characters)",
                    priority: "important",
                    externalResourceLink: "https://moz.com/learn/seo/on-page-factors",
                    externalResourceTitle: "Moz: On-Page Ranking Factors"
                });
            }
        });
        
        // Check for proper heading structure (no skipped levels)
        const h3Nodes = nodes.filter(node => 
            node.name.toLowerCase() === "h3" || 
            node.name.toLowerCase() === "heading3" ||
            node.name.toLowerCase().includes("h3") ||
            (node.style?.fontSize && node.style.fontSize >= 20 && node.style.fontSize < 24));
            
        if (h2Nodes.length === 0 && h3Nodes.length > 0) {
            issues.push({
                type: "warning",
                message: "H3 headings found without H2 headings",
                category: this.category,
                recommendation: "Don't skip heading levels (use H2 before H3) for proper document structure",
                priority: "important",
                externalResourceLink: "https://www.w3.org/WAI/tutorials/page-structure/headings/",
                externalResourceTitle: "W3C: Headings"
            });
        }
    }
    
    // Find the most appropriate H1 from multiple candidates
    private findMainH1(h1Nodes: FramerNode[]): FramerNode | null {
        if (h1Nodes.length === 0) return null;
        
        // Try to find the one that appears first (typically at the top of the page)
        // This is a simplified implementation - in a real scenario, we would need to
        // check the actual position on the page
        
        // Try to find the one with "title" or "main" in the name
        const mainTitleNode = h1Nodes.find(node => 
            node.name.toLowerCase().includes("title") || 
            node.name.toLowerCase().includes("main") ||
            node.name.toLowerCase() === "h1");
            
        if (mainTitleNode) return mainTitleNode;
        
        // If we can't find one with a descriptive name, return the first one
        return h1Nodes[0];
    }
    
    private checkSemanticElements(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for semantic elements like header, nav, main, article, section, aside, footer
        const semanticElements = ["header", "nav", "main", "article", "section", "aside", "footer"];
        const foundSemanticElements = semanticElements.filter(element => 
            nodes.some(node => node.name.toLowerCase() === element || node.name.toLowerCase().includes(element)));
            
        const missingSemanticElements = semanticElements.filter(element => 
            !foundSemanticElements.includes(element));
            
        if (missingSemanticElements.length > 0) {
            issues.push({
                type: "warning",
                message: `Missing semantic HTML elements: ${missingSemanticElements.join(", ")}`,
                category: this.category,
                recommendation: "Use semantic HTML elements to improve accessibility and SEO",
                priority: "important",
                externalResourceLink: "https://web.dev/learn/html/semantic-html/",
                externalResourceTitle: "Learn HTML: Semantic HTML"
            });
        }
        
        // Check for proper nesting of elements
        // This is a simplified implementation - in a real scenario, we would need to
        // check the actual DOM structure
        if (foundSemanticElements.includes("article") && !foundSemanticElements.includes("main")) {
            issues.push({
                type: "info",
                message: "Article element used without a main element",
                category: this.category,
                recommendation: "Wrap article elements in a main element for better semantic structure",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/learn/html/semantic-html/",
                externalResourceTitle: "Learn HTML: Semantic HTML"
            });
        }
    }
    
    private checkContentStructure(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for too much text without headings
        const textNodes = nodes.filter(node => 
            node.type === "text" && 
            !node.name.toLowerCase().includes("h1") && 
            !node.name.toLowerCase().includes("h2") && 
            !node.name.toLowerCase().includes("h3") &&
            !node.name.toLowerCase().includes("heading"));
            
        const headingNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("h1") || 
            node.name.toLowerCase().includes("h2") || 
            node.name.toLowerCase().includes("h3") ||
            node.name.toLowerCase().includes("heading"));
            
        if (textNodes.length > 10 && headingNodes.length < 3) {
            issues.push({
                type: "info",
                message: "Long content with few headings",
                category: this.category,
                recommendation: "Break up long content with more headings to improve readability and SEO",
                priority: "important",
                externalResourceLink: "https://www.searchenginejournal.com/content-marketing/long-form-content/",
                externalResourceTitle: "How to Create Long-Form Content That Ranks, Reads Well & Converts"
            });
        }
        
        // Check for list elements
        const listNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("list") || 
            node.name.toLowerCase().includes("ul") || 
            node.name.toLowerCase().includes("ol"));
            
        if (listNodes.length === 0) {
            issues.push({
                type: "info",
                message: "No list elements found",
                category: this.category,
                recommendation: "Consider using lists to structure content and improve readability",
                priority: "nice-to-have",
                externalResourceLink: "https://www.semrush.com/blog/semantic-html5-guide/",
                externalResourceTitle: "Semantic HTML5: A Guide for Better SEO and UX"
            });
        }
    }
} 