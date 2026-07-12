✨ UI/UX, 🐛 Fixes, 🌐 i18n & ♻️ Refactoring Updates

✨ UI/UX Polishing:
- Replaced native alert() with a reusable PremiumFeatureModal for the "Image Text Recognition" feature.

🐛 Bug Fixes:
- Resolved mobile dynamic viewport jank with 100dvh and transition adjustments.
- Cleaned up unused toast variable to clear ESLint warnings.

🌐 Localization:
- Implemented dynamic i18n localization for the new Modal across English, Burmese, and Thai.

♻️ Refactoring:
- Consolidated modal logic into a reusable PremiumFeatureModal component.
- Refactored CSS specificity in NoteModal.css to ensure uniform hover animations across all Tag buttons by removing strict .tag-option--lyrics selectors.
