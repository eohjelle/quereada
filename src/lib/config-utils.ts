/**
 * Utilities available to quereada.config.ts files.
 * These are injected as globals before the config is loaded,
 * so configs can use them without npm imports.
 *
 * Usage in config:
 *   // No import needed - these are available globally
 *   query: {
 *     where: {
 *       date_added: { gte: subDays(new Date(), 3) }
 *     }
 *   }
 */

// Date utilities from date-fns
export {
    subDays,
    addDays,
    subWeeks,
    addWeeks,
    subMonths,
    addMonths,
    subYears,
    addYears,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    isAfter,
    isBefore,
    parseISO,
    format
} from 'date-fns';

/**
 * All utilities that will be available as globals in config files.
 * Add new utilities here to make them available.
 */
import * as dateFns from 'date-fns';

export const configUtilities: Record<string, unknown> = {
    // Date utilities
    subDays: dateFns.subDays,
    addDays: dateFns.addDays,
    subWeeks: dateFns.subWeeks,
    addWeeks: dateFns.addWeeks,
    subMonths: dateFns.subMonths,
    addMonths: dateFns.addMonths,
    subYears: dateFns.subYears,
    addYears: dateFns.addYears,
    startOfDay: dateFns.startOfDay,
    endOfDay: dateFns.endOfDay,
    startOfWeek: dateFns.startOfWeek,
    endOfWeek: dateFns.endOfWeek,
    startOfMonth: dateFns.startOfMonth,
    endOfMonth: dateFns.endOfMonth,
    isAfter: dateFns.isAfter,
    isBefore: dateFns.isBefore,
    parseISO: dateFns.parseISO,
    format: dateFns.format,
};
