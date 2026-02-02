export const translations: Record<string, Record<string, string>> = {
    en: {
        'settings.title': 'Giveaway Bot Settings',
        'settings.language.name': 'Language',
        'settings.language.description': 'Select the language for the bot.',
        'settings.role.name': 'Manager Role',
        'settings.role.description': 'Select the role that can create giveaways.',
        'settings.updated': 'Settings updated successfully!',
        'settings.no_permission': 'You do not have permission to use this command.',
        'settings.language.updated': 'Language updated to English.',
        'settings.role.updated': 'Manager role updated to {role}.'
    },
    de: {
        'settings.title': 'Gewinnspiel Bot Einstellungen',
        'settings.language.name': 'Sprache',
        'settings.language.description': 'Wähle die Sprache für den Bot.',
        'settings.role.name': 'Manager Rolle',
        'settings.role.description': 'Wähle die Rolle, die Gewinnspiele erstellen kann.',
        'settings.updated': 'Einstellungen erfolgreich aktualisiert!',
        'settings.no_permission': 'Du hast keine Berechtigung, diesen Befehl zu verwenden.',
        'settings.language.updated': 'Sprache auf Deutsch aktualisiert.',
        'settings.role.updated': 'Manager Rolle auf {role} aktualisiert.'
    }
};

export function getTranslation(key: string, lang: string = 'en', args?: Record<string, string>): string {
    const language = translations[lang] ? lang : 'en';
    let text = translations[language][key] || translations['en'][key] || key;

    if (args) {
        for (const [k, v] of Object.entries(args)) {
            text = text.replace(`{${k}}`, v);
        }
    }

    return text;
}
