import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class MetadataAnalyzer implements Analyzer {
    category: SEOCategory = "metadata";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for title tag
        this.checkTitleTag(nodes, issues);
        
        // Check for meta description
        this.checkMetaDescription(nodes, issues);
        
        // Check for meta viewport
        this.checkMetaViewport(nodes, issues);
        
        // Check for canonical URL
        this.checkCanonicalUrl(nodes, issues);
        
        // Check for language attribute
        this.checkLanguageAttribute(nodes, issues);
        
        // Check for meta robots
        this.checkMetaRobots(nodes, issues);
        
        // Check for favicon
        this.checkFavicon(nodes, issues);
        
        return issues;
    }
    
    private checkTitleTag(nodes: FramerNode[], issues: SEOIssue[]): void {
        const titleNode = nodes.find(node => 
            node.name.toLowerCase() === "title" || 
            node.name.toLowerCase().includes("title-tag"));
            
        if (!titleNode) {
            issues.push({
                type: "error",
                message: "Missing title tag",
                category: this.category,
                recommendation: "Add a descriptive title tag that includes your main keyword",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/docs/appearance/title-link",
                externalResourceTitle: "Google: Control your title links in search results"
            });
            return;
        }
        
        const titleText = titleNode.text || "";
        
        // Check title length
        if (titleText.length < 30) {
            issues.push({
                type: "warning",
                message: "Title tag is too short",
                category: this.category,
                recommendation: "Make your title tag between 50-60 characters for optimal display in search results",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/title-tag",
                externalResourceTitle: "Moz: Title Tag"
            });
        } else if (titleText.length > 60) {
            issues.push({
                type: "warning",
                message: "Title tag is too long",
                category: this.category,
                recommendation: "Keep your title tag under 60 characters to prevent truncation in search results",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/title-tag",
                externalResourceTitle: "Moz: Title Tag"
            });
        }
        
        // Check for keyword presence
        if (!this.containsKeyword(titleText, this.getKeywords(nodes))) {
            issues.push({
                type: "warning",
                message: "Title tag doesn't contain primary keyword",
                category: this.category,
                recommendation: "Include your primary keyword in the title tag for better SEO",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/title-tag",
                externalResourceTitle: "Moz: Title Tag - SEO Best Practices"
            });
        }
    }
    
    private checkMetaDescription(nodes: FramerNode[], issues: SEOIssue[]): void {
        const descriptionNode = nodes.find(node => 
            (node.metadata?.name === "description") ||
            (node.name.toLowerCase().includes("meta") && node.name.toLowerCase().includes("description")));
            
        if (!descriptionNode) {
            issues.push({
                type: "error",
                message: "Missing meta description",
                category: this.category,
                recommendation: "Add a meta description that accurately summarizes the page content and includes your target keywords",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/docs/appearance/snippet",
                externalResourceTitle: "Google: Create good meta descriptions"
            });
            return;
        }
        
        const descriptionText = descriptionNode.text || descriptionNode.metadata?.content || "";
        
        // Check description length
        if (descriptionText.length < 120) {
            issues.push({
                type: "warning",
                message: "Meta description is too short",
                category: this.category,
                recommendation: "Make your meta description between 120-158 characters for optimal display in search results",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/meta-description",
                externalResourceTitle: "Moz: Meta Description"
            });
        } else if (descriptionText.length > 158) {
            issues.push({
                type: "warning",
                message: "Meta description is too long",
                category: this.category,
                recommendation: "Keep your meta description under 158 characters to prevent truncation in search results",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/meta-description",
                externalResourceTitle: "Moz: Meta Description"
            });
        }
        
        // Check for keyword presence
        if (!this.containsKeyword(descriptionText, this.getKeywords(nodes))) {
            issues.push({
                type: "warning",
                message: "Meta description doesn't contain primary keyword",
                category: this.category,
                recommendation: "Include your primary keyword in the meta description for better SEO",
                priority: "important",
                externalResourceLink: "https://ahrefs.com/blog/meta-description/",
                externalResourceTitle: "How to Write the Perfect Meta Description"
            });
        }
    }
    
    private checkMetaViewport(nodes: FramerNode[], issues: SEOIssue[]): void {
        const viewportNode = nodes.find(node => 
            (node.metadata?.name === "viewport") ||
            (node.name.toLowerCase().includes("meta") && node.name.toLowerCase().includes("viewport")));
            
        if (!viewportNode) {
            issues.push({
                type: "error",
                message: "Missing meta viewport tag",
                category: this.category,
                recommendation: "Add a meta viewport tag for proper mobile rendering (e.g., <meta name='viewport' content='width=device-width, initial-scale=1'>)",
                priority: "critical",
                externalResourceLink: "https://web.dev/viewport/",
                externalResourceTitle: "Responsive Web Design Basics: Set the viewport"
            });
            return;
        }
        
        const viewportContent = viewportNode.metadata?.content || "";
        
        if (!viewportContent.includes("width=device-width") || !viewportContent.includes("initial-scale=1")) {
            issues.push({
                type: "warning",
                message: "Incomplete meta viewport tag",
                category: this.category,
                recommendation: "Ensure your meta viewport tag includes 'width=device-width, initial-scale=1'",
                priority: "important",
                externalResourceLink: "https://web.dev/viewport/",
                externalResourceTitle: "Responsive Web Design Basics: Set the viewport"
            });
        }
    }
    
    private checkCanonicalUrl(nodes: FramerNode[], issues: SEOIssue[]): void {
        const canonicalNode = nodes.find(node => 
            (node.rel === "canonical") ||
            (node.name.toLowerCase().includes("link") && node.name.toLowerCase().includes("canonical")));
            
        if (!canonicalNode) {
            issues.push({
                type: "warning",
                message: "Missing canonical URL",
                category: this.category,
                recommendation: "Add a canonical URL to prevent duplicate content issues",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
                externalResourceTitle: "Google: Consolidate duplicate URLs"
            });
        }
    }
    
    private checkLanguageAttribute(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for HTML node with lang attribute
        // In a real implementation, we would check the actual lang attribute
        // For our purpose, we'll just check if the node name contains "lang"
        const htmlLangNode = nodes.find(node => 
            node.name.toLowerCase().includes("html-lang") ||
            node.name.toLowerCase().includes("html") && node.name.toLowerCase().includes("lang"));
            
        if (!htmlLangNode) {
            issues.push({
                type: "warning",
                message: "Missing language attribute on HTML tag",
                category: this.category,
                recommendation: "Add a lang attribute to the HTML tag (e.g., <html lang='en'>)",
                priority: "important",
                externalResourceLink: "https://web.dev/learn/accessibility/aria-html/#language",
                externalResourceTitle: "Web.dev: Use the lang attribute"
            });
        }
    }
    
    private checkMetaRobots(nodes: FramerNode[], issues: SEOIssue[]): void {
        const robotsNode = nodes.find(node => 
            (node.metadata?.name === "robots") ||
            (node.name.toLowerCase().includes("meta") && node.name.toLowerCase().includes("robots")));
            
        if (!robotsNode) {
            issues.push({
                type: "info",
                message: "No meta robots tag found",
                category: this.category,
                recommendation: "Consider adding a meta robots tag to control search engine crawling and indexing",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
                externalResourceTitle: "Google: Robots meta tag and X-Robots-Tag HTTP header specifications"
            });
            return;
        }
        
        const robotsContent = robotsNode.metadata?.content || "";
        
        if (robotsContent.includes("noindex") || robotsContent.includes("nofollow")) {
            issues.push({
                type: "warning",
                message: `Meta robots tag contains ${robotsContent.includes("noindex") ? "noindex" : "nofollow"}`,
                category: this.category,
                recommendation: "Ensure you want to prevent search engines from indexing or following links on this page",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
                externalResourceTitle: "Google: Robots meta tag and X-Robots-Tag HTTP header specifications"
            });
        }
    }
    
    private checkFavicon(nodes: FramerNode[], issues: SEOIssue[]): void {
        const faviconNode = nodes.find(node => 
            (node.rel === "icon" || node.rel === "shortcut icon") ||
            (node.name.toLowerCase().includes("favicon")) ||
            (node.name.toLowerCase().includes("link") && node.name.toLowerCase().includes("icon")));
            
        if (!faviconNode) {
            issues.push({
                type: "info",
                message: "Missing favicon",
                category: this.category,
                recommendation: "Add a favicon to improve brand recognition and user experience",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/learn/html/document-structure/#favicons",
                externalResourceTitle: "Web.dev: Favicons"
            });
        }
    }
    
    // Helper method to extract keywords from the content
    private getKeywords(nodes: FramerNode[]): string[] {
        // Look for keywords meta tag first
        const keywordsNode = nodes.find(node => 
            (node.metadata?.name === "keywords") ||
            (node.name.toLowerCase().includes("meta") && node.name.toLowerCase().includes("keywords")));
            
        if (keywordsNode && keywordsNode.metadata?.content) {
            return keywordsNode.metadata.content.split(",").map(k => k.trim().toLowerCase());
        }
        
        // Extract keyword from headings and title
        const title = nodes.find(node => 
            node.name.toLowerCase() === "title" ||
            node.name.toLowerCase().includes("title-tag"));
            
        const h1 = nodes.find(node => 
            node.name.toLowerCase() === "h1" || 
            node.name.toLowerCase().includes("heading1"));
            
        const keywords: string[] = [];
        
        if (title?.text) {
            const titleWords = title.text.split(" ")
                .filter(word => word.length > 3)
                .map(word => word.toLowerCase())
                .slice(0, 3);
            keywords.push(...titleWords);
        }
        
        if (h1?.text) {
            const h1Words = h1.text.split(" ")
                .filter(word => word.length > 3)
                .map(word => word.toLowerCase())
                .slice(0, 3);
            keywords.push(...h1Words);
        }
        
        // Remove duplicates
        return [...new Set(keywords)];
    }
    
    // Helper method to check if a text contains any of the keywords
    private containsKeyword(text: string, keywords: string[]): boolean {
        if (keywords.length === 0) return true; // No keywords to check against
        
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword));
    }
} 