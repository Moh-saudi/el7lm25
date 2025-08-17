'use client';

// Compatibility shim to unify translation usage across the app.
// Re-export the simple translation context so both old and new imports work.

export { TranslationProvider, useTranslation } from './simple-context';

// Alias for components importing useTranslations from this module
export const useTranslations = require('./simple-context').useTranslation;