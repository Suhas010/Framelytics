import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class LinksAnalyzer implements Analyzer {
    category: SEOCategory = "links";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for broken or problematic links
        this.checkBrokenLinks(nodes, issues);
        
        // Check for link text quality
        this.checkLinkText(nodes, issues);
        
        // Check for external links
        this.checkExternalLinks(nodes, issues);
        
        // Check for internal linking structure
        this.checkInternalLinking(nodes, issues);
        
        return issues;
    }
    
    private checkBrokenLinks(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all link nodes
        const linkNodes = nodes.filter(node => 
            node.href || 
            node.name.toLowerCase().includes("link") || 
            node.name.toLowerCase().includes("anchor") ||
            node.role === "link");
            
        if (linkNodes.length === 0) {
            issues.push({
                type: "info",
                message: "No links detected on the page",
                category: this.category,
                recommendation: "Consider adding internal and external links to improve navigation and SEO",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/internal-link",
                externalResourceTitle: "Moz: Internal Links"
            });
            return;
        }
        
        // Check each link for potential issues
        linkNodes.forEach(linkNode => {
            const href = linkNode.href || "";
            
            // Check for empty links
            if (!href) {
                issues.push({
                    type: "error",
                    message: `Empty href in link "${linkNode.name}"`,
                    category: this.category,
                    element: linkNode.name,
                    elementId: linkNode.id,
                    recommendation: "Add a valid URL to all links",
                    priority: "critical",
                    externalResourceLink: "https://web.dev/learn/html/links/#href",
                    externalResourceTitle: "Web.dev: Link href attribute"
                });
                return;
            }
            
            // Check for placeholder links
            if (href === "#" || href === "javascript:void(0)") {
                issues.push({
                    type: "warning",
                    message: `Placeholder link href="${href}" in "${linkNode.name}"`,
                    category: this.category,
                    element: linkNode.name,
                    elementId: linkNode.id,
                    recommendation: "Replace placeholder links with valid URLs or use buttons for JavaScript actions",
                    priority: "important",
                    externalResourceLink: "https://web.dev/learn/html/links/#javascript-links",
                    externalResourceTitle: "Web.dev: JavaScript links"
                });
                return;
            }
            
            // Check for potentially broken links
            // In a real implementation, this would involve actually fetching the URL
            // to check if it returns a valid response
            
            // For now, we'll check for common issues that might indicate broken links
            if (href.includes("example.com") || 
                href.includes("placeholder") || 
                href.includes("dummy") ||
                href.includes("test") ||
                href.includes(".temp")) {
                issues.push({
                    type: "warning",
                    message: `Potentially broken link: ${href}`,
                    category: this.category,
                    element: linkNode.name,
                    elementId: linkNode.id,
                    recommendation: "Replace example/placeholder URLs with actual valid links",
                    priority: "critical",
                    externalResourceLink: "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
                    externalResourceTitle: "Google: Ensure your links are crawlable"
                });
            }
            
            // Check for malformed URLs
            try {
                new URL(href);
            } catch {
                // Check if it might be a relative URL
                if (!href.startsWith("/") && !href.startsWith("#") && !href.startsWith("./") && !href.startsWith("../")) {
                    issues.push({
                        type: "warning",
                        message: `Potentially malformed URL: ${href}`,
                        category: this.category,
                        element: linkNode.name,
                        elementId: linkNode.id,
                        recommendation: "Ensure the URL format is correct",
                        priority: "important",
                        externalResourceLink: "https://web.dev/learn/html/links/#url-structure",
                        externalResourceTitle: "Web.dev: URL structure"
                    });
                }
            }
        });
        
        // Add information about broken link checking
        issues.push({
            type: "info",
            message: "Verify all links work in production",
            category: this.category,
            recommendation: "Regularly check for broken links using a tool like Screaming Frog or Google Search Console",
            priority: "important",
            externalResourceLink: "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
            externalResourceTitle: "Google: Make your links crawlable"
        });
    }
    
    private checkLinkText(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all link nodes with text
        const linkNodes = nodes.filter(node => 
            (node.href || node.role === "link" || node.name.toLowerCase().includes("link")) && 
            node.text);
            
        // Check for generic link text
        const genericPhrases = ["click here", "read more", "learn more", "more info", "details", "link"];
        
        linkNodes.forEach(linkNode => {
            const linkText = linkNode.text?.toLowerCase() || "";
            
            if (genericPhrases.some(phrase => linkText.includes(phrase)) && linkText.length < 20) {
                issues.push({
                    type: "warning",
                    message: `Generic link text: "${linkNode.text}"`,
                    category: this.category,
                    element: linkNode.name,
                    elementId: linkNode.id,
                    recommendation: "Use descriptive link text that makes sense out of context",
                    priority: "important",
                    externalResourceLink: "https://web.dev/learn/accessibility/links/",
                    externalResourceTitle: "Web.dev: Links and accessibility"
                });
            }
            
            // Check for very long link text
            if (linkText.length > 100) {
                issues.push({
                    type: "info",
                    message: `Very long link text (${linkText.length} characters)`,
                    category: this.category,
                    element: linkNode.name,
                    elementId: linkNode.id,
                    recommendation: "Keep link text concise and descriptive",
                    priority: "nice-to-have",
                    externalResourceLink: "https://web.dev/learn/accessibility/links/",
                    externalResourceTitle: "Web.dev: Links and accessibility"
                });
            }
        });
    }
    
    private checkExternalLinks(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all external links
        const externalLinkNodes = nodes.filter(node => {
            if (!node.href) return false;
            try {
                const url = new URL(node.href);
                // Consider it external if it has a hostname that's not clearly local
                return url.hostname && 
                    !url.hostname.includes("localhost") && 
                    !url.hostname.includes("127.0.0.1");
            } catch {
                return false; // Not a valid absolute URL
            }
        });
        
        // Check for target="_blank" and rel attributes
        externalLinkNodes.forEach(linkNode => {
            // Check if the node has appropriate security attributes for external links
            const hasRelNoopener = linkNode.rel?.includes("noopener") || false;
            const hasRelNoreferrer = linkNode.rel?.includes("noreferrer") || false;
            
            // Assuming target="_blank" is stored in a property or can be inferred from the name
            const hasTargetBlank = linkNode.name.toLowerCase().includes("blank") || 
                                 linkNode.name.toLowerCase().includes("newwindow") || 
                                 linkNode.name.toLowerCase().includes("external");
            
            if (hasTargetBlank && !(hasRelNoopener || hasRelNoreferrer)) {
                issues.push({
                    type: "warning",
                    message: `External link missing security attributes: ${linkNode.href}`,
                    category: this.category,
                    element: linkNode.name,
                    elementId: linkNode.id,
                    recommendation: 'Add rel="noopener noreferrer" to external links that open in new tabs',
                    priority: "important",
                    externalResourceLink: "https://web.dev/learn/html/links/#opening-links-in-a-new-tab",
                    externalResourceTitle: "Web.dev: Opening links in a new tab"
                });
            }
        });
        
        // Check for links to potential spam domains
        const spamDomains = ["casino", "pharma", "pills", "betting", "loan", "kredit", "xxx"];
        
        externalLinkNodes.forEach(linkNode => {
            try {
                const url = new URL(linkNode.href || "");
                if (spamDomains.some(domain => url.hostname.includes(domain))) {
                    issues.push({
                        type: "error",
                        message: `Potential spam domain in link: ${linkNode.href}`,
                        category: this.category,
                        element: linkNode.name,
                        elementId: linkNode.id,
                        recommendation: "Remove links to potential spam domains to avoid SEO penalties",
                        priority: "critical",
                        externalResourceLink: "https://developers.google.com/search/docs/essentials/spam-policies",
                        externalResourceTitle: "Google: Spam policies"
                    });
                }
            } catch {
                // Skip invalid URLs
            }
        });
    }
    
    private checkInternalLinking(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all link nodes
        const linkNodes = nodes.filter(node => 
            node.href || 
            node.name.toLowerCase().includes("link") || 
            node.role === "link");
            
        // Count internal vs external links
        let internalLinkCount = 0;
        
        linkNodes.forEach(linkNode => {
            if (!linkNode.href) return;
            
            try {
                const url = new URL(linkNode.href);
                if (!(url.hostname && 
                    !url.hostname.includes("localhost") && 
                    !url.hostname.includes("127.0.0.1"))) {
                    internalLinkCount++;
                }
            } catch {
                // Assume relative URLs are internal
                if (linkNode.href.startsWith("/") || 
                    linkNode.href.startsWith("#") || 
                    linkNode.href.startsWith("./") || 
                    linkNode.href.startsWith("../")) {
                    internalLinkCount++;
                }
            }
        });
        
        // Check for sufficient internal linking
        if (internalLinkCount < 3 && linkNodes.length > 0) {
            issues.push({
                type: "warning",
                message: "Limited internal linking detected",
                category: this.category,
                recommendation: "Add more internal links to improve site navigation and SEO",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/internal-link",
                externalResourceTitle: "Moz: Internal Links"
            });
        }
        
        // Check for proper anchor text in internal links
        const internalLinks = linkNodes.filter(node => {
            if (!node.href) return false;
            
            try {
                const url = new URL(node.href);
                return !url.hostname || 
                    url.hostname.includes("localhost") || 
                    url.hostname.includes("127.0.0.1");
            } catch {
                // Assume relative URLs are internal
                return node.href.startsWith("/") || 
                    node.href.startsWith("#") || 
                    node.href.startsWith("./") || 
                    node.href.startsWith("../");
            }
        });
        
        // Look for duplicate link text
        const linkTextCounts: Record<string, number> = {};
        
        internalLinks.forEach(linkNode => {
            const linkText = linkNode.text?.toLowerCase() || "";
            if (linkText) {
                linkTextCounts[linkText] = (linkTextCounts[linkText] || 0) + 1;
            }
        });
        
        const duplicateTexts = Object.entries(linkTextCounts)
            .filter(([, count]) => count > 1)
            .map(([text]) => text);
            
        if (duplicateTexts.length > 0) {
            issues.push({
                type: "info",
                message: `Duplicate link text found: ${duplicateTexts.join(", ")}`,
                category: this.category,
                recommendation: "Use unique, descriptive link text for different destinations",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/learn/accessibility/links/#unique-link-text",
                externalResourceTitle: "Web.dev: Unique link text"
            });
        }
    }
} 