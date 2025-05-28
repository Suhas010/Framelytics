import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class ContentAnalyzer implements Analyzer {
    category: SEOCategory = "content";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for content length
        this.checkContentLength(nodes, issues);
        
        // Check for keyword density
        this.checkKeywordDensity(nodes, issues);
        
        // Check for readability
        this.checkReadability(nodes, issues);
        
        // Check for thin content
        this.checkThinContent(nodes, issues);
        
        return issues;
    }
    
    private checkContentLength(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Get all text content
        const textNodes = nodes.filter(node => 
            node.type === "text" || 
            node.text || 
            node.name.toLowerCase().includes("text") ||
            node.name.toLowerCase().includes("paragraph"));
            
        // Calculate total content length
        const totalTextContent = textNodes.reduce((acc, node) => acc + (node.text || "").length, 0);
        
        if (totalTextContent < 300) {
            issues.push({
                type: "warning",
                message: "Content length is too short",
                category: this.category,
                recommendation: "Add more content to your page. Aim for at least 300 words for better SEO performance",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/on-page-factors",
                externalResourceTitle: "Moz: On-Page Ranking Factors"
            });
        } else if (totalTextContent > 10000) {
            issues.push({
                type: "info",
                message: "Content is very long",
                category: this.category,
                recommendation: "Consider breaking very long content into multiple pages or adding table of contents for better user experience",
                priority: "nice-to-have",
                externalResourceLink: "https://www.searchenginejournal.com/content-marketing/long-form-content/",
                externalResourceTitle: "How to Create Long-Form Content That Ranks, Reads Well & Converts"
            });
        }
    }
    
    private checkKeywordDensity(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Get all text content
        const textContent = nodes
            .filter(node => node.text)
            .map(node => node.text || "")
            .join(" ");
            
        if (textContent.length === 0) return;
        
        // Find potential keywords (very simplified)
        const words = textContent.toLowerCase().split(/\s+/);
        const wordCounts: Record<string, number> = {};
        
        // Count word frequency
        for (const word of words) {
            // Only consider words with 4+ characters
            if (word.length >= 4) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        }
        
        // Find the most frequent words
        const sortedWords = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        if (sortedWords.length === 0) return;
        
        // Check keyword density for the most frequent word
        const [topKeyword, count] = sortedWords[0];
        const density = count / words.length * 100;
        
        if (density > 5) {
            issues.push({
                type: "warning",
                message: `Keyword "${topKeyword}" appears too frequently (${density.toFixed(1)}%)`,
                category: this.category,
                recommendation: "Avoid keyword stuffing. Keep keyword density below 3-5% for natural content",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/on-page-factors",
                externalResourceTitle: "Moz: On-Page Ranking Factors"
            });
        }
        
        // Check if important keywords appear in headings
        const headingNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("h1") || 
            node.name.toLowerCase().includes("h2") || 
            node.name.toLowerCase().includes("heading"));
            
        const headingTexts = headingNodes.map(node => (node.text || "").toLowerCase());
        
        // Check if top 3 keywords appear in headings
        for (let i = 0; i < Math.min(3, sortedWords.length); i++) {
            const [keyword] = sortedWords[i];
            const keywordInHeadings = headingTexts.some(text => text.includes(keyword));
            
            if (!keywordInHeadings) {
                issues.push({
                    type: "info",
                    message: `Keyword "${keyword}" doesn't appear in any headings`,
                    category: this.category,
                    recommendation: "Include important keywords in your headings for better SEO",
                    priority: "nice-to-have",
                    externalResourceLink: "https://moz.com/learn/seo/on-page-factors",
                    externalResourceTitle: "Moz: On-Page Ranking Factors"
                });
                break; // Only show one suggestion for this issue
            }
        }
    }
    
    private checkReadability(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Get all paragraph text
        const paragraphNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("paragraph") || 
            node.name.toLowerCase().includes("text") ||
            (node.text && node.text.length > 100));
            
        if (paragraphNodes.length === 0) return;
        
        // Check for very long paragraphs
        const longParagraphs = paragraphNodes.filter(node => 
            (node.text?.length || 0) > 300);
            
        if (longParagraphs.length > 0) {
            issues.push({
                type: "info",
                message: "Some paragraphs are very long",
                category: this.category,
                recommendation: "Break long paragraphs into smaller chunks of 3-4 sentences for better readability",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/learn/accessibility/typography/#content-structure",
                externalResourceTitle: "Web.dev: Content structure"
            });
        }
        
        // Check for complex sentences (very simplified)
        const complexSentences = paragraphNodes.filter(node => {
            const text = node.text || "";
            const sentences = text.split(/[.!?]+/);
            
            // Consider a sentence complex if it has more than 25 words
            return sentences.some(sentence => {
                const words = sentence.trim().split(/\s+/);
                return words.length > 25;
            });
        });
        
        if (complexSentences.length > 0) {
            issues.push({
                type: "info",
                message: "Some sentences may be too complex",
                category: this.category,
                recommendation: "Simplify complex sentences for better readability. Aim for an average sentence length of 15-20 words",
                priority: "nice-to-have",
                externalResourceLink: "https://yoast.com/readability-checks-in-yoast-seo/",
                externalResourceTitle: "Yoast: Readability checks"
            });
        }
    }
    
    private checkThinContent(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for pages with too little unique content
        const textNodes = nodes.filter(node => node.text);
        
        if (textNodes.length === 0) {
            issues.push({
                type: "error",
                message: "No text content found on the page",
                category: this.category,
                recommendation: "Add meaningful text content to your page for SEO and user experience",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/docs/essentials/content-quality-guidelines",
                externalResourceTitle: "Google: Content quality guidelines"
            });
            return;
        }
        
        // Calculate total unique content
        const allText = textNodes.map(node => node.text || "").join(" ");
        const words = allText.split(/\s+/).filter(word => word.length > 0);
        const uniqueWords = new Set(words.map(word => word.toLowerCase()));
        
        // Check for duplicate content
        if (uniqueWords.size < words.length * 0.5) {
            issues.push({
                type: "warning",
                message: "Content has a high level of repetition",
                category: this.category,
                recommendation: "Reduce repetitive content and add more unique content to avoid thin content issues",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/essentials/content-quality-guidelines",
                externalResourceTitle: "Google: Content quality guidelines"
            });
        }
        
        // Check for content-to-code ratio (simplified)
        if (words.length < 100 && nodes.length > 50) {
            issues.push({
                type: "warning",
                message: "Low content-to-code ratio detected",
                category: this.category,
                recommendation: "Add more meaningful content relative to the page structure to improve SEO",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/essentials/content-quality-guidelines",
                externalResourceTitle: "Google: Content quality guidelines"
            });
        }
    }
} 