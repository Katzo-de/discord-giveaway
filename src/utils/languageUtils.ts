export const translations: Record<string, Record<string, string>> = {
    en: {
        'settings.title': 'Giveaway Bot Settings',
        'settings.language.name': 'Language Configuration',
        'settings.language.description': 'Select the preferred language for the bot interface and messages. This will affect all interactions within this server.',
        'settings.role.name': 'Manager Role',
        'settings.role.description': 'Assign a specific role that allows members to create, manage, and end giveaways. Users with Administrator permissions always have access.',
        'settings.schedule.name': 'Schedule Management',
        'settings.schedule.description': 'View and manage your recurring giveaways. You can edit intervals or cancel upcoming scheduled giveaways here.',
        'settings.schedule.button': 'Manage Schedule',
        'settings.template.name': 'Template Management',
        'settings.template.description': 'Create reusable templates for frequently hosted giveaways to save time. You can create new ones or delete existing templates.',
        'settings.template.create': 'Create Template',
        'settings.template.delete': 'Delete Template',
        'settings.updated': 'Settings have been successfully updated!',
        'settings.no_permission': 'You do not have the required permissions to perform this action.',
        'settings.language.updated': 'Language has been updated to English.',
        'settings.role.updated': 'Manager role has been updated to {role}.',
        'settings.timezone.name': 'Timezone Configuration',
        'settings.timezone.description': 'Select your server\'s timezone to ensure giveaway start and end times are accurate for your users.',
        'settings.timezone.current': 'Current Timezone',
        'settings.timezone.placeholder': 'Select Timezone',
        'settings.timezone.updated': 'Timezone has been updated to {timezone}.',

        // Wizard
        'wizard.title': 'Giveaway Wizard',
        'wizard.description': 'Welcome to the Giveaway Wizard! Follow the steps below to create your perfect giveaway.',
        'wizard.step1.title': 'Step 1: Basic Setup',
        'wizard.step1.description': 'Start by defining the core details. You can manually enter the Title, Description, and Prize, or select an existing Template to autofill these fields.',
        'wizard.step1.button': 'Setup Details',
        'wizard.step1.select.placeholder': 'Select a Template (Optional)',
        'wizard.step1.select.no_templates': 'No templates available',
        'wizard.step1.select.create_template': 'Create a template to see it here',
        'wizard.step2.title': 'Step 2: Configuration',
        'wizard.step2.description': 'Customize the rules. Set the Duration (e.g., 24h) and number of Winners.',
        'wizard.step2.button': 'Configure Settings',
        'wizard.step3.title': 'Step 3: Scheduling (Coming Soon)',
        'wizard.step3.description': 'Schedule this giveaway to repeat automatically (Mock).',
        'wizard.step3.button': 'Set Schedule',
        'wizard.review.title': 'Ready to Launch?',
        'wizard.review.description': 'Review your settings below. You can preview how it looks, save it as a new template for future use, or publish it immediately!',
        'wizard.button.preview': 'Preview Giveaway',
        'wizard.button.template': 'Save as Template',
        'wizard.button.publish': 'Publish Now',

        // Giveaway Container
        'giveaway.hosted_by': 'Hosted By',
        'giveaway.participants': 'Participants',
        'giveaway.winners': 'Winners',
        'giveaway.prize': 'Prize',
        'giveaway.ends': 'Ends',
        'giveaway.ended': 'Ended',
        'giveaway.join': 'Join',
        'giveaway.leave': 'Leave',
        'giveaway.end': 'End',
        'giveaway.reroll': 'Reroll',

        // End / Reroll
        'giveaway.ended.title': 'Giveaway Ended',
        'giveaway.ended.description': 'This giveaway has ended.',
        'giveaway.ended.no_winners': 'No winners.',
        'giveaway.ended.winners': 'Winners:',
        'giveaway.winner.message': '🎉 Congratulations {winners}! You won **{prize}**! 🎉',
        'giveaway.no_entries': 'No valid entries, so no winner could be chosen.',
        'giveaway.reroll.success': 'Rerolled! New winner: {winner}',
        'giveaway.reroll.message': '🎉 **Reroll:** The new winner is {winner}! Congratulations!',
        'giveaway.reroll.no_entries': 'No entries found for this giveaway.'
    },
    de: {
        'settings.title': 'Gewinnspiel Bot Einstellungen',
        'settings.language.name': 'Sprachkonfiguration',
        'settings.language.description': 'Wähle die bevorzugte Sprache für die Bot-Oberfläche und Nachrichten. Dies betrifft alle Interaktionen auf diesem Server.',
        'settings.role.name': 'Manager Rolle',
        'settings.role.description': 'Weise eine bestimmte Rolle zu, die es Mitgliedern ermöglicht, Gewinnspiele zu erstellen, zu verwalten und zu beenden. Administratoren haben immer Zugriff.',
        'settings.schedule.name': 'Zeitplan-Verwaltung',
        'settings.schedule.description': 'Verwalte deine wiederkehrenden Gewinnspiele. Hier kannst du Intervalle bearbeiten oder geplante Gewinnspiele abbrechen.',
        'settings.schedule.button': 'Zeitplan verwalten',
        'settings.template.name': 'Vorlagen-Verwaltung',
        'settings.template.description': 'Erstelle wiederverwendbare Vorlagen für häufige Gewinnspiele, um Zeit zu sparen. Du kannst neue erstellen oder bestehende löschen.',
        'settings.template.create': 'Vorlage erstellen',
        'settings.template.delete': 'Vorlage löschen',
        'settings.updated': 'Einstellungen wurden erfolgreich aktualisiert!',
        'settings.no_permission': 'Du hast nicht die erforderlichen Berechtigungen, um diese Aktion durchzuführen.',
        'settings.language.updated': 'Sprache wurde auf Deutsch aktualisiert.',
        'settings.role.updated': 'Manager Rolle wurde auf {role} aktualisiert.',
        'settings.timezone.name': 'Zeitzonen-Konfiguration',
        'settings.timezone.description': 'Wähle die Zeitzone deines Servers, damit Start- und Endzeiten für deine Benutzer korrekt angezeigt werden.',
        'settings.timezone.current': 'Aktuelle Zeitzone',
        'settings.timezone.placeholder': 'Zeitzone wählen',
        'settings.timezone.updated': 'Zeitzone wurde auf {timezone} aktualisiert.',

        // Wizard
        'wizard.title': 'Gewinnspiel-Assistent',
        'wizard.description': 'Willkommen beim Gewinnspiel-Assistenten! Folge den Schritten unten, um dein perfektes Gewinnspiel zu erstellen.',
        'wizard.step1.title': 'Schritt 1: Grundeinstellungen',
        'wizard.step1.description': 'Beginne mit den wichtigsten Details. Du kannst Titel, Beschreibung und Preis manuell eingeben oder eine vorhandene Vorlage auswählen.',
        'wizard.step1.button': 'Details einrichten',
        'wizard.step1.select.placeholder': 'Wähle eine Vorlage (Optional)',
        'wizard.step1.select.no_templates': 'Keine Vorlagen verfügbar',
        'wizard.step1.select.create_template': 'Erstelle eine Vorlage, um sie hier zu sehen',
        'wizard.step2.title': 'Schritt 2: Einstellungen',
        'wizard.step2.description': 'Lege die Dauer (z.B. 24h) und die Anzahl der Gewinner fest.',
        'wizard.step2.button': 'Einstellungen',
        'wizard.step3.title': 'Schritt 3: Zeitplan (Bald verfügbar)',
        'wizard.step3.description': 'Erstelle einen Zeitplan für automatische Wiederholungen (Mock).',
        'wizard.step3.button': 'Zeitplan',
        'wizard.review.title': 'Bereit zum Start?',
        'wizard.review.description': 'Überprüfe deine Einstellungen unten. Du kannst eine Vorschau ansehen, es als neue Vorlage speichern oder sofort veröffentlichen!',
        'wizard.button.preview': 'Vorschau anzeigen',
        'wizard.button.template': 'Als Vorlage speichern',
        'wizard.button.publish': 'Jetzt veröffentlichen',

        // Giveaway Container
        'giveaway.hosted_by': 'Veranstaltet von',
        'giveaway.participants': 'Teilnehmer',
        'giveaway.winners': 'Gewinner',
        'giveaway.prize': 'Preis',
        'giveaway.ends': 'Endet',
        'giveaway.ended': 'Beendet',
        'giveaway.join': 'Teilnehmen',
        'giveaway.leave': 'Verlassen',
        'giveaway.end': 'Beenden',
        'giveaway.reroll': 'Neu auslosen',

        // End / Reroll
        'giveaway.ended.title': 'Gewinnspiel Beendet',
        'giveaway.ended.description': 'Dieses Gewinnspiel ist beendet.',
        'giveaway.ended.no_winners': 'Keine Gewinner.',
        'giveaway.ended.winners': 'Gewinner:',
        'giveaway.winner.message': '🎉 Herzlichen Glückwunsch {winners}! Du hast **{prize}** gewonnen! 🎉',
        'giveaway.no_entries': 'Keine gültigen Teilnehmer, daher konnte kein Gewinner ermittelt werden.',
        'giveaway.reroll.success': 'Neu ausgelost! Neuer Gewinner: {winner}',
        'giveaway.reroll.message': '🎉 **Neu ausgelost:** Der neue Gewinner ist {winner}! Herzlichen Glückwunsch!',
        'giveaway.reroll.no_entries': 'Keine Teilnehmer für dieses Gewinnspiel gefunden.'
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
