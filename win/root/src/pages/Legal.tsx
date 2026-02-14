import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="gradient-text">Legal</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in leading-relaxed">
              Licensing, trademarks, and legal information
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Company Information */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Company Information</h2>
                  <p className="text-muted-foreground">Legal entity and trademark ownership</p>
                </div>
              </div>
              
              <div className="space-y-4 text-lg">
                <div className="bg-muted/50 rounded-lg p-6 border border-border/30">
                  <p className="mb-4">
                    <span className="font-semibold text-foreground">Legal Entity:</span><br />
                    <span className="text-muted-foreground">UnifiedGaming Systems Ltd</span>
                  </p>
                  <p className="mb-4">
                    <span className="font-semibold text-foreground">Trading As:</span><br />
                    <span className="text-muted-foreground">Doughmination System</span>
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Registered Trademark:</span><br />
                    <span className="text-muted-foreground">Doughmination System® (United Kingdom, UK00004263144)</span>
                  </p>
                </div>
                
                <p className="text-muted-foreground">
                  All intellectual property, trademarks, software licenses, and legal rights associated with 
                  Doughmination System are owned and controlled by <strong className="text-foreground">UnifiedGaming Systems Ltd</strong>.
                </p>
              </div>
            </div>

            {/* Software License */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Software License</h2>
                  <p className="text-muted-foreground">ESAL-1.3 (Estrogen Source-Available Licence)</p>
                </div>
              </div>

              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Our software is licensed under the <strong className="text-foreground">Estrogen Source-Available Licence (ESAL-1.3)</strong>.
                </p>
                <p>
                  This license allows free use for non-commercial purposes while requiring a separate commercial license for business use.
                </p>
              </div>

              <details className="mt-6 group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/70 rounded-lg transition-colors duration-200">
                    <span className="font-semibold text-foreground">View Full License Text</span>
                    <svg 
                      className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                
                <div className="mt-4 bg-muted/30 rounded-lg p-6 border border-border/30 font-mono text-sm overflow-x-auto max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{`# The Estrogen Source-Available Licence

**Version 1.3**

This Licence may be referred to as the **Estrogen Source-Available Licence (ESAL)**. This specific version may be referred to as **ESAL-1.3**.

Copyright © 2026 Clove Nytrix Doughmination Twilight.

---

## Permission Grant (Non-Commercial Use)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, publish, and distribute the Software **for non-commercial purposes only**, subject to the conditions set out below.

Non-commercial use includes, but is not limited to, personal use, academic use, research, experimentation, and use within non-profit or hobbyist projects, **provided that no direct or indirect commercial advantage, monetary compensation, or revenue generation results from use of the Software**.

---

## 1. Attribution

All copies or substantial portions of the Software must include the above copyright notice and this Licence.

Attribution to **"Clove Nytrix Doughmination Twilight"** must be maintained in a reasonable and visible manner in source code distributions and in accompanying documentation.

---

## 2. No Misrepresentation

You may not misrepresent the origin of the Software.

Modified versions must be clearly identified as modified and must not be presented as being authored, endorsed, or distributed by Clove Nytrix Doughmination Twilight without prior written permission.

---

## 3. Commercial Use Restriction

The Software may not be used, in whole or in part, for any commercial purpose without a separate, written commercial licence granted by Clove Nytrix Doughmination Twilight.

For the purposes of this Licence, *commercial use* includes, but is not limited to:

* selling, licensing, sublicensing, or otherwise monetising the Software or derivative works;
* using the Software as part of any product, service, or platform that generates revenue;
* use by a for-profit entity where the Software contributes to business operations, service delivery, or profit generation;
* providing paid services, hosting, consultancy, or support that relies upon or incorporates the Software.

Commercial licensing terms (including fees and/or revenue-sharing arrangements) shall be determined on a case-by-case basis.

---

## 4. Commercial Licensing

### 4.1 Obtaining a Commercial Licence

Any individual or organisation wishing to use the Software for a commercial purpose must obtain a separate, written commercial licence.

Requests for commercial licensing must be made via email to:

**admin@clovelib.win**

Commercial licence terms may include fees, revenue-sharing arrangements, usage limitations, or other conditions, and are granted solely at the discretion of Clove Nytrix Doughmination Twilight.

### 4.2 Pre-Authorised Commercial Licensees

Clove Nytrix Doughmination Twilight may maintain a file named **allowed_people.md** listing individuals or organisations that have been granted permission to use the Software commercially.

If **allowed_people.md** is present and lists a party, that listing constitutes evidence of an active commercial licence, subject to any terms specified therein.

If **allowed_people.md** does **not** exist, or if a party is not listed within it, **no commercial licence is granted**, and commercial use remains prohibited.

---

## 5. Trademarked Components

### 5.1 Definition

For the purposes of this Licence, **"Trademarked Components"** means any names, systems, frameworks, identifiers, branding, terminology, logos, marks, or distinctive elements that are protected by trademark or otherwise designated as trademarked by Clove Nytrix Doughmination Twilight, whether registered or unregistered, now existing or created in the future.

Trademarked Components include, but are not limited to, any elements that are:

* explicitly identified as trademarks;
* referenced as part of a branded system, methodology, or product line;
* required for compatibility with, recognition of, or association with a trademarked offering;
* reasonably understood to indicate origin, endorsement, or branding by Clove Nytrix Doughmination Twilight.

### 5.2 Ownership and Listed Trademarks

This Licence does not grant permission to use any trademarks, trade names, service marks, or logos associated with Clove Nytrix Doughmination Twilight.

The following trademarks are currently claimed or owned by Clove Nytrix Doughmination Twilight:

* **Doughmination System®** (United Kingdom, UK00004263144)

This list is **non-exhaustive**. Any future trademarks, trademark applications, or unregistered marks designated by Clove Nytrix Doughmination Twilight are automatically considered Trademarked Components under this Licence.

### 5.3 Restriction on Modification and Reuse

Any Trademarked Components, and any Software components that are connected to, rely upon, implement, enable, or are designed to operate in conjunction with such Trademarked Components, **may not be modified, adapted, reworked, extracted, repurposed, or redistributed**, in whole or in part, without prior written permission from Clove Nytrix Doughmination Twilight.

This includes both direct modification and indirect modification through derivative works, abstractions, renaming, or functional equivalents that preserve the trademarked identity or system.

### 5.4 Separation from Non-Trademarked Use

Projects, forks, or derivative works that do **not** reference, include, depend upon, or associate with any Trademarked Components remain fully subject to the permissions and restrictions set out elsewhere in this Licence and may be modified in accordance with its terms.

---

## 6. Warranty Disclaimer and Limitation of Liability

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OF OR OTHER DEALINGS IN THE SOFTWARE.

---

## 7. No Endorsement or Affiliation

Use of the Software does not imply endorsement, sponsorship, affiliation, or approval by Clove Nytrix Doughmination Twilight.

You may not state or suggest that Clove Nytrix Doughmination Twilight endorses, certifies, supports, or is affiliated with any project, product, service, or derivative work without prior written permission.

---

## 8. No Compatibility or Certification Claims

You may not claim or imply that the Software, or any modified or derivative version thereof, is compatible with, certified by, approved by, or officially associated with any trademarked system or offering of Clove Nytrix Doughmination Twilight, including any Trademarked Components, without express written authorisation.

---

## 9. No Implied Rights

No rights or permissions are granted under this Licence except those expressly stated.

Any use of the Software beyond the scope of this Licence requires prior written permission from Clove Nytrix Doughmination Twilight.

---

## 10. Source-Available, Not Open Source

This Licence makes the source code available for inspection, modification, and non-commercial use under defined conditions.

It is **not** an open-source licence as defined by the Open Source Initiative, and no rights should be inferred or assumed beyond those explicitly granted herein.

---

## 11. Revocation of Commercial Licences

Clove Nytrix Doughmination Twilight reserves the right to revoke any granted commercial licence at any time, with or without cause, subject to any written terms agreed with the commercial licensee.

Upon revocation, all commercial use of the Software must cease immediately unless otherwise agreed in writing.

---

## 12. Governing Law (Trademark Matters)

All matters relating to trademarks, Trademarked Components, and trademark enforcement under this Licence shall be governed by and construed in accordance with the laws of **England and Wales**, without regard to conflict-of-law principles.`}</pre>
                </div>
              </details>

              <div className="mt-6">
                <a 
                  href="mailto:admin@clovelib.win" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Request Commercial License
                </a>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8 border border-primary/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Questions About Licensing?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  If you have questions about our license, need clarification on usage terms, or want to 
                  discuss commercial licensing options, we're here to help.
                </p>
                <a 
                  href="mailto:admin@clovelib.win"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Legal;