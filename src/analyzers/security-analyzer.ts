import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class SecurityAnalyzer implements Analyzer {
    category: SEOCategory = "security";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for HTTPS usage
        this.checkHttpsUsage(nodes, issues);
        
        // Check for secure forms
        this.checkSecureForms(nodes, issues);
        
        // Check for security headers
        this.checkSecurityHeaders(nodes, issues);
        
        // Check for external resources
        this.checkExternalResources(nodes, issues);
        
        // Check for content security policy
        this.checkContentSecurityPolicy(nodes, issues);
        
        return issues;
    }
    
    private checkHttpsUsage(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for HTTP URLs
        const httpUrls = nodes.filter(node => {
            const href = node.href || "";
            const content = node.metadata?.content || "";
            const text = node.text || "";
            
            return (href.startsWith("http://") && !href.includes("localhost")) || 
                   (content.startsWith("http://") && !content.includes("localhost")) ||
                   (text.includes("http://") && !text.includes("localhost"));
        });
        
        if (httpUrls.length > 0) {
            issues.push({
                type: "error",
                message: "Insecure HTTP URLs detected",
                category: this.category,
                recommendation: "Replace all HTTP URLs with HTTPS to ensure secure connections",
                priority: "critical",
                externalResourceLink: "https://web.dev/why-https-matters/",
                externalResourceTitle: "Web.dev: Why HTTPS matters"
            });
        }
        
        // Check for mixed content
        const httpsWithMixedContent = nodes.filter(node => {
            const href = node.href || "";
            return href.startsWith("https://") && node.text?.includes("http://") && 
                   !node.text.includes("localhost");
        });
        
        if (httpsWithMixedContent.length > 0) {
            issues.push({
                type: "warning",
                message: "Potential mixed content issues",
                category: this.category,
                recommendation: "Ensure all resources are loaded over HTTPS to prevent mixed content warnings",
                priority: "important",
                externalResourceLink: "https://web.dev/what-is-mixed-content/",
                externalResourceTitle: "Web.dev: What is mixed content?"
            });
        }
    }
    
    private checkSecureForms(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all form elements
        const formNodes = nodes.filter(node => 
            node.type === "form" || 
            node.name.toLowerCase().includes("form"));
            
        if (formNodes.length === 0) return;
        
        // Check for insecure form action
        const insecureFormActions = formNodes.filter(node => {
            const action = node.name.toLowerCase().includes("action=") ? 
                          node.name.substring(node.name.indexOf("action=") + 7) : "";
            return action.startsWith("http://") && !action.includes("localhost");
        });
        
        if (insecureFormActions.length > 0) {
            issues.push({
                type: "error",
                message: "Insecure form submission",
                category: this.category,
                recommendation: "Ensure all form actions use HTTPS to protect user data during transmission",
                priority: "critical",
                externalResourceLink: "https://web.dev/security-forms/",
                externalResourceTitle: "Web.dev: Secure forms"
            });
        }
        
        // Check for sensitive information without secure transmission
        const potentiallySensitiveForms = formNodes.filter(node => 
            node.name.toLowerCase().includes("password") || 
            node.name.toLowerCase().includes("credit") || 
            node.name.toLowerCase().includes("card") || 
            node.name.toLowerCase().includes("payment") || 
            node.name.toLowerCase().includes("login") || 
            node.name.toLowerCase().includes("signin"));
            
        for (const form of potentiallySensitiveForms) {
            const hasAutocompleteOff = form.name.toLowerCase().includes("autocomplete=\"off\"") || 
                                      form.name.toLowerCase().includes("autocomplete='off'");
                                      
            if (hasAutocompleteOff) {
                issues.push({
                    type: "warning",
                    message: "Autocomplete disabled on sensitive form",
                    category: this.category,
                    recommendation: "Avoid disabling autocomplete on password fields to allow password managers to work",
                    priority: "important",
                    externalResourceLink: "https://web.dev/sign-in-form-best-practices/#autocomplete",
                    externalResourceTitle: "Web.dev: Autocomplete for login forms"
                });
            }
        }
    }
    
    private checkSecurityHeaders(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for security headers in meta tags
        const securityHeadersInMeta = [
            "content-security-policy",
            "x-content-type-options",
            "x-frame-options",
            "x-xss-protection",
            "referrer-policy"
        ];
        
        let foundSecurityHeaders = false;
        
        const metaNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("meta"));
            
        for (const node of metaNodes) {
            const httpEquiv = node.name.toLowerCase().includes("http-equiv=") ? 
                             node.name.substring(node.name.indexOf("http-equiv=") + 11) : "";
                             
            if (securityHeadersInMeta.some(header => httpEquiv.includes(header))) {
                foundSecurityHeaders = true;
                break;
            }
        }
        
        if (!foundSecurityHeaders) {
            issues.push({
                type: "info",
                message: "No security headers detected",
                category: this.category,
                recommendation: "Consider implementing security headers like Content-Security-Policy, X-Content-Type-Options, etc.",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/security-headers/",
                externalResourceTitle: "Web.dev: Security headers"
            });
        }
    }
    
    private checkExternalResources(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find script and link nodes
        const externalScripts = nodes.filter(node => 
            (node.type === "script" && node.href && !node.href.includes("integrity=")) || 
            (node.name.toLowerCase().includes("script") && 
             node.name.toLowerCase().includes("src=") && 
             !node.name.toLowerCase().includes("integrity=")));
            
        const externalStyles = nodes.filter(node => 
            (node.type === "link" && 
             node.rel === "stylesheet" && 
             node.href && 
             !node.href.includes("integrity=")) || 
            (node.name.toLowerCase().includes("link") && 
             node.name.toLowerCase().includes("stylesheet") && 
             node.name.toLowerCase().includes("href=") && 
             !node.name.toLowerCase().includes("integrity=")));
             
        if (externalScripts.length > 0 || externalStyles.length > 0) {
            issues.push({
                type: "info",
                message: "External resources without SRI",
                category: this.category,
                recommendation: "Use Subresource Integrity (SRI) for external scripts and stylesheets",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/csp-sri/",
                externalResourceTitle: "Web.dev: Subresource Integrity"
            });
        }
        
        // Check for suspicious domains
        const suspiciousDomains = ["evil", "hack", "malware", "phish", "suspicious"];
        const potentiallySuspiciousResources = nodes.filter(node => {
            const href = node.href || "";
            return suspiciousDomains.some(domain => href.includes(domain));
        });
        
        if (potentiallySuspiciousResources.length > 0) {
            issues.push({
                type: "error",
                message: "Potentially suspicious resource domains",
                category: this.category,
                recommendation: "Review external resources for suspicious or malicious domains",
                priority: "critical",
                externalResourceLink: "https://owasp.org/www-community/attacks/xss/",
                externalResourceTitle: "OWASP: Cross-Site Scripting (XSS)"
            });
        }
    }
    
    private checkContentSecurityPolicy(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for CSP meta tag
        const cspNode = nodes.find(node => 
            (node.name.toLowerCase().includes("meta") && 
             node.name.toLowerCase().includes("content-security-policy")) || 
            (node.metadata?.name === "http-equiv" && 
             node.metadata?.content?.toLowerCase().includes("content-security-policy")));
             
        if (!cspNode) {
            issues.push({
                type: "info",
                message: "No Content Security Policy detected",
                category: this.category,
                recommendation: "Implement a Content Security Policy to mitigate XSS and data injection attacks",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/csp/",
                externalResourceTitle: "Web.dev: Content Security Policy"
            });
            return;
        }
        
        // Check for 'unsafe-inline' or 'unsafe-eval'
        const cspContent = cspNode.metadata?.content || "";
        
        if (cspContent.includes("unsafe-inline") || cspContent.includes("unsafe-eval")) {
            issues.push({
                type: "warning",
                message: "Weak Content Security Policy",
                category: this.category,
                recommendation: "Avoid using 'unsafe-inline' or 'unsafe-eval' in your Content Security Policy",
                priority: "important",
                externalResourceLink: "https://web.dev/strict-csp/",
                externalResourceTitle: "Web.dev: Mitigate XSS with a strict CSP"
            });
        }
    }
} 