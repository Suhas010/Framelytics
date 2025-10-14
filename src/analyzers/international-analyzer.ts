import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class InternationalAnalyzer implements Analyzer {
    category: SEOCategory = "metadata"; // Using metadata as the category since international SEO is primarily metadata-based

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for hreflang tags
        this.checkHreflangTags(nodes, issues);
        
        // Check for language declaration
        this.checkLanguageDeclaration(nodes, issues);
        
        // Check for geo-targeting meta tags
        this.checkGeoTargeting(nodes, issues);
        
        // Check for content in multiple languages
        this.checkMultilingualContent(nodes, issues);
        
        // Check for international URL structures
        this.checkInternationalURLs(nodes, issues);
        
        return issues;
    }
    
    private checkHreflangTags(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for hreflang attributes
        const hreflangNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("hreflang") || 
            (node.rel === "alternate" && node.name.toLowerCase().includes("hreflang")));
            
        // Check if site has content in multiple languages
        const hasMultilingualIndicators = nodes.some(node => 
            node.name.toLowerCase().includes("language switcher") || 
            node.name.toLowerCase().includes("language selector") || 
            node.name.toLowerCase().includes("multilingual") || 
            node.name.toLowerCase().includes("translate"));
            
        // If site has multilingual indicators but no hreflang
        if (hasMultilingualIndicators && hreflangNodes.length === 0) {
            issues.push({
                type: "error",
                message: "Multilingual site without hreflang tags",
                category: this.category,
                recommendation: "Add hreflang tags to help search engines understand the language and regional targeting of your pages",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/crawling/localized-versions",
                externalResourceTitle: "Google: Tell Google about localized versions of your page"
            });
        }
        
        // Check for potential issues with existing hreflang tags
        if (hreflangNodes.length > 0) {
            // Check for self-referencing hreflang
            const hasSelfReference = hreflangNodes.some(node => 
                node.name.toLowerCase().includes("self") || 
                node.name.toLowerCase().includes("current"));
                
            if (!hasSelfReference) {
                issues.push({
                    type: "warning",
                    message: "Missing self-referencing hreflang tag",
                    category: this.category,
                    recommendation: "Include a self-referencing hreflang tag for each language version of a page",
                    priority: "important",
                    externalResourceLink: "https://developers.google.com/search/docs/advanced/crawling/localized-versions#html",
                    externalResourceTitle: "Google: Specify the language and region for a page"
                });
            }
            
            // Check for reciprocal hreflang tags
            // In a real implementation, we would need to check across all pages
            // This is just a placeholder for demonstration purposes
            issues.push({
                type: "info",
                message: "Verify reciprocal hreflang tags across all language versions",
                category: this.category,
                recommendation: "Ensure all language versions of a page reference each other with hreflang tags",
                priority: "nice-to-have",
                externalResourceLink: "https://ahrefs.com/blog/hreflang-tags/",
                externalResourceTitle: "Ahrefs: Hreflang Tags: The Ultimate Guide"
            });
        }
    }
    
    private checkLanguageDeclaration(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for HTML lang attribute
        const htmlWithLang = nodes.some(node => 
            (node.name.toLowerCase().includes("html") && node.name.toLowerCase().includes("lang=")) || 
            node.name.toLowerCase().includes("html-lang"));
            
        if (!htmlWithLang) {
            issues.push({
                type: "warning",
                message: "Missing language declaration (html lang attribute)",
                category: this.category,
                recommendation: "Add the lang attribute to your HTML tag to declare the language of your page",
                priority: "important",
                externalResourceLink: "https://web.dev/learn/html/document-structure/#lang",
                externalResourceTitle: "Web.dev: The lang attribute"
            });
        }
        
        // Check for content-language meta tag
        const contentLanguageNode = nodes.find(node => 
            (node.metadata?.name === "content-language") || 
            (node.name.toLowerCase().includes("meta") && node.name.toLowerCase().includes("content-language")));
            
        if (!contentLanguageNode && !htmlWithLang) {
            issues.push({
                type: "warning",
                message: "No language metadata found",
                category: this.category,
                recommendation: "Specify the language of your page using the html lang attribute or content-language meta tag",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/crawling/localized-versions#language-html",
                externalResourceTitle: "Google: Tell Google the language of a page"
            });
        }
    }
    
    private checkGeoTargeting(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for geo-targeting meta tags
        const geoMetaNode = nodes.find(node => 
            (node.metadata?.name === "geo.region" || 
             node.metadata?.name === "geo.placename" || 
             node.metadata?.name === "geo.position") || 
            (node.name.toLowerCase().includes("meta") && 
             (node.name.toLowerCase().includes("geo.region") || 
              node.name.toLowerCase().includes("geo.placename") || 
              node.name.toLowerCase().includes("geo.position"))));
              
        // Check for region-specific content indicators
        const hasRegionalContent = nodes.some(node => 
            node.text?.match(/[A-Z]{2}\s+\d{5}/) || // US Zip Code
            node.text?.match(/[A-Z]{2}\s+[A-Z0-9]{3}/) || // UK Postal Code format
            node.text?.match(/€|£|¥|₹|₽/) || // Currency symbols
            node.name.toLowerCase().includes("region") || 
            node.name.toLowerCase().includes("country"));
            
        if (hasRegionalContent && !geoMetaNode) {
            issues.push({
                type: "info",
                message: "Regional content without geo-targeting metadata",
                category: this.category,
                recommendation: "Consider adding geo-targeting meta tags for content specific to geographic regions",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites",
                externalResourceTitle: "Google: Managing Multi-Regional and Multilingual Sites"
            });
        }
    }
    
    private checkMultilingualContent(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for indicators of multiple languages in the same page
        const textNodes = nodes.filter(node => 
            node.type === "text" || 
            node.name.toLowerCase().includes("text") || 
            node.name.toLowerCase().includes("paragraph") || 
            node.name.toLowerCase().includes("heading"));
            
        // This is a simplified check that looks for text in different languages
        // In a real implementation, we would use a language detection library
        let hasMixedLanguages = false;
        
        // Look for text that might be in different languages
        // This is a very simplified approach - just looking for common words in different languages
        const languageIndicators = {
            english: ["the", "and", "of", "to", "in", "is", "you", "that", "it", "for"],
            spanish: ["el", "la", "los", "las", "y", "que", "en", "de", "es", "para"],
            french: ["le", "la", "les", "et", "que", "en", "dans", "est", "pour", "avec"],
            german: ["der", "die", "das", "und", "zu", "in", "ist", "für", "mit", "auf"]
        };
        
        const languagesDetected = new Set<string>();
        
        for (const node of textNodes) {
            const text = node.text?.toLowerCase() || "";
            
            if (text.length > 0) {
                for (const [language, words] of Object.entries(languageIndicators)) {
                    if (words.some(word => {
                        const regex = new RegExp(`\\b${word}\\b`, "i");
                        return regex.test(text);
                    })) {
                        languagesDetected.add(language);
                    }
                }
            }
        }
        
        // If more than one language is detected on the page
        if (languagesDetected.size > 1) {
            hasMixedLanguages = true;
        }
        
        if (hasMixedLanguages) {
            issues.push({
                type: "warning",
                message: "Mixed languages detected on the same page",
                category: this.category,
                recommendation: "Avoid mixing multiple languages on the same page. Create separate pages for each language instead.",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites",
                externalResourceTitle: "Google: Managing multi-regional and multilingual sites"
            });
        }
    }
    
    private checkInternationalURLs(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for links to international versions
        const internationalLinks = nodes.filter(node => {
            const href = node.href || "";
            
            // Check for common international URL patterns
            return href.includes("/en/") || href.includes("/fr/") || 
                   href.includes("/es/") || href.includes("/de/") || 
                   href.includes("/it/") || href.includes("/ru/") || 
                   href.includes(".com/en") || href.includes(".com/fr") || 
                   href.includes(".fr/") || href.includes(".es/") || 
                   href.includes(".de/") || href.includes(".it/") || 
                   href.includes(".co.uk/") || href.includes(".com.au/");
        });
        
        if (internationalLinks.length > 0) {
            // Check if international URLs follow a consistent pattern
            const countryCodePattern = internationalLinks.filter(node => 
                (node.href?.includes("/en/") || node.href?.includes("/fr/") || 
                 node.href?.includes("/es/") || node.href?.includes("/de/")));
                 
            const ccTLDPattern = internationalLinks.filter(node => 
                (node.href?.includes(".fr") || node.href?.includes(".es") || 
                 node.href?.includes(".de") || node.href?.includes(".co.uk")));
                 
            if (countryCodePattern.length > 0 && ccTLDPattern.length > 0) {
                issues.push({
                    type: "warning",
                    message: "Inconsistent international URL structure",
                    category: this.category,
                    recommendation: "Use a consistent URL structure for international versions (either subdirectories, subdomains, or ccTLDs)",
                    priority: "important",
                    externalResourceLink: "https://ahrefs.com/blog/international-seo/",
                    externalResourceTitle: "Ahrefs: International SEO - A Complete Guide"
                });
            }
        }
    }
} 