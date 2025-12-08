<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Type: MINOR (New principle added)
Date: 2025-11-24

Modified Principles:
- NEW: V. Documentation Language Requirements

Added Sections:
- None

Templates Requiring Updates:
✅ plan-template.md - Updated with language requirement checks (Constitution V)
✅ spec-template.md - Updated with language requirement section (Constitution V)
✅ tasks-template.md - No changes needed (task descriptions can be in any language)
✅ checklist-template.md - Updated with language compliance check item (CHK005)

Follow-up TODOs:
- None (all templates updated)

Rationale for Version 1.1.0:
- Added new non-negotiable principle (V. Documentation Language Requirements)
- This is a material expansion of governance guidance
- Existing principles unchanged
- Constitution document converted to English for consistency
- All specifications, plans, and user-facing documentation MUST be in Traditional Chinese (zh-TW)
-->

# Base-Repository-Config Project Constitution

## Core Principles

### I. Code Quality Standards

All code must meet the following non-negotiable quality standards:

- **Readability First**: Code must clearly express intent, use meaningful naming, and follow consistent style guides
- **SOLID Principles**: All object-oriented design must follow Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles
- **Code Review Mandatory**: All code changes must be reviewed and approved by at least one team member
- **Static Analysis Tools**: Must use linters and formatters; build process must not allow warnings
- **Technical Debt Tracking**: Any known code quality compromises must be documented as technical debt items with remediation plans and priority

**Rationale**: High-quality codebase ensures long-term maintainability, reduces defect rates, and promotes team collaboration efficiency. Code is read far more often than written, making readability the most critical investment.

### II. Test-Driven Development (NON-NEGOTIABLE)

Test-first approach is mandatory with no exceptions:

- **Red-Green-Refactor Cycle**: Strictly enforce TDD workflow → Write failing test → Implement minimal code to pass → Refactor
- **Test Coverage Thresholds**: Unit test coverage must be ≥ 80%, critical business logic must reach 100%
- **Test Type Stratification**:
  - Unit Tests: Isolated testing of individual functions/methods
  - Integration Tests: Verify interactions between components
  - Contract Tests: Validate API interface promises
  - End-to-End Tests: Verify complete user scenarios (for critical paths)
- **Test-First Validation**: Before implementing code, must demonstrate test failure to confirm test validity
- **Continuous Integration**: All tests must run automatically in CI pipeline; failures block merges

**Rationale**: TDD ensures every line of code is testable and verified. This is not just a quality assurance mechanism but a design tool that drives better architectural decisions. Test-first immediately reveals requirement ambiguities.

### III. User Experience Consistency

All user-facing features must provide consistent and predictable experiences:

- **Design System Adherence**: Must establish and maintain design system defining reusable UI components, interaction patterns, and visual language
- **Accessibility Standards**: Comply with WCAG 2.1 AA level standards, including keyboard navigation, screen reader support, and color contrast
- **Responsive Design**: Interface must function properly and maintain usability across all target devices and screen sizes
- **Error Handling Consistency**: All error messages must be clear, actionable, user-friendly, avoiding technical jargon
- **Loading and Feedback States**: All asynchronous operations must provide real-time visual feedback (loading indicators, progress bars, optimistic updates)
- **User Testing Validation**: New features must undergo usability testing or A/B testing to ensure user expectations are met

**Rationale**: Consistent UX builds user trust, reduces cognitive load, and decreases support costs. Accessible design is not only a legal requirement but expands user base and improves experience for everyone.

### IV. Performance Requirements

System performance is a functional requirement, not an afterthought:

- **Response Time Targets**:
  - API Endpoints: P95 latency < 200ms (simple queries), < 1s (complex operations)
  - UI Interactions: First Contentful Paint (FCP) < 1.5s, Time to Interactive (TTI) < 3.5s
  - Database Queries: Critical path queries < 50ms
- **Performance Monitoring**: Continuously monitor Core Web Vitals (LCP, FID, CLS) and custom business metrics in production
- **Performance Budgets**: Set and enforce budget limits for JavaScript bundle size, image assets, and memory usage
- **Performance Test Automation**: CI pipeline must include performance regression testing and load testing for critical endpoints
- **Optimization Priority**: Before implementing new features, must analyze and optimize performance hotspots
- **Scalability Considerations**: Architectural decisions must consider anticipated user growth and data volume expansion

**Rationale**: Performance directly impacts user retention, conversion rates, and business outcomes. Slow applications lead to user abandonment. Treating performance as a functional requirement ensures consideration at design stage rather than post-implementation patches.

### V. Documentation Language Requirements (NON-NEGOTIABLE)

All specifications, plans, and user-facing documentation MUST be written in Traditional Chinese (zh-TW):

- **Specifications**: All files in `/specs/` directory (spec.md, plan.md, research.md, data-model.md, quickstart.md, etc.) MUST be in Traditional Chinese
- **User-Facing Documentation**: README files, user guides, API documentation, tutorials, and changelogs targeting end users MUST be in Traditional Chinese
- **Technical Comments**: Code comments SHOULD be in English for international collaboration, but business logic explanations MAY be in Traditional Chinese when clarity demands it
- **Internal Communication**: Team discussions, commit messages, and pull request descriptions SHOULD be in Traditional Chinese for team efficiency
- **Exception**: This constitution document, code, and technical infrastructure configuration files remain in English for universal compatibility

**Rationale**: Standardizing on Traditional Chinese for specifications and user documentation ensures clarity for the primary stakeholder audience, reduces translation errors, and accelerates communication within teams primarily operating in Traditional Chinese-speaking environments. Code remains in English to maintain compatibility with international development tools and practices.

## Performance Standards

### Frontend Performance

- **Initial Load**: Desktop < 3s, Mobile < 5s (3G network)
- **Bundle Size**: Main JavaScript bundle < 200KB (gzipped)
- **Image Optimization**: Use modern formats (WebP, AVIF), implement lazy loading
- **Caching Strategy**: Set long-lived cache headers for static assets (1 year), use versioning for updates

### Backend Performance

- **Database Indexing**: All query fields must have appropriate indexes, query plans must be reviewed
- **N+1 Query Prevention**: Use query analysis tools to detect and eliminate N+1 issues
- **Caching Layers**: Implement multi-tier caching strategy (memory, Redis, CDN) with clearly defined invalidation strategies
- **Asynchronous Processing**: Long-running operations must be asynchronous with user status updates

### Performance Monitoring Metrics

- **Availability**: System uptime > 99.9%
- **Error Rate**: Production error rate < 0.1%
- **Throughput**: Define and monitor requests per second (RPS) targets based on business needs

## Quality Gates

### Pre-Merge

- [ ] All tests pass (unit, integration, contract)
- [ ] Code coverage meets threshold (≥ 80%)
- [ ] Code review completed and approved
- [ ] Static analysis shows no warnings or errors
- [ ] Accessibility checks pass (for UI changes)
- [ ] Performance benchmarks show no regression
- [ ] Documentation in Traditional Chinese (for specs and user-facing docs)

### Pre-Release

- [ ] End-to-end tests pass all critical user paths
- [ ] Performance metrics meet defined SLAs
- [ ] Security scans show no high or medium vulnerabilities
- [ ] Documentation updated (API docs, user guides, changelogs) in Traditional Chinese
- [ ] Backward compatibility verified (or explicitly marked as breaking change)

## Governance

### Constitution Authority

This constitution supersedes all other development practices, style guides, or team conventions. Any practices conflicting with constitutional principles must be corrected or granted exemption through formal amendment process.

### Amendment Process

Constitution amendments require:

1. **Proposal Document**: Detailed description of proposed changes, rationale, and impact scope
2. **Team Review**: All core contributors must review and provide feedback
3. **Approval Threshold**: At least 75% of core team members agree
4. **Migration Plan**: For breaking changes, must provide migration strategy for existing code
5. **Version Update**: Update constitution version according to semantic versioning rules

### Versioning Rules

Constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Removal or redefinition of core principles, backward-incompatible governance changes
- **MINOR**: New principle or section added, material expansion of guidance
- **PATCH**: Clarifications, wording fixes, typo corrections, non-semantic refinements

### Compliance Review

- All pull requests must undergo constitution compliance checks
- Any principle violations must be explicitly raised and resolved in code review
- Complexity increases (adding projects, introducing new architectural patterns) must provide written justification in planning documents
- Quarterly review meetings evaluate constitution effectiveness and identify improvement opportunities

### Development Guidance Reference

For runtime development guidance and best practice examples, refer to instruction files in `.github/instructions/` directory and template files in `.specify/templates/`.

**Version**: 1.1.0 | **Ratified**: 2025-11-24 | **Last Amended**: 2025-11-24
