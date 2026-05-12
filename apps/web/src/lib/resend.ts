import { Resend } from 'resend'
import { getCountryConfig, formatCurrency, DEFAULT_COUNTRY } from './country-config'

// Lazy-init: Resend throws if API key is missing, which breaks `next build` in CI
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env['RESEND_API_KEY'] ?? 'placeholder')
  }
  return _resend
}
const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'Yalla.House <noreply@yalla.house>'
const BASE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yalla.house'

const EMAIL_TRANSLATIONS = {
  'en-GB': {
    ownerBriefSubject: 'New Owner Brief',
    ownerBriefGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    ownerBriefIntro: (city: string, postcode: string) =>
      `A property owner in ${city || postcode} has sent you an Owner Brief via Yalla.House. They're looking for competing proposals from local agents.`,
    ownerBriefArea: 'Area',
    ownerBriefType: 'Type',
    ownerBriefPrice: 'Price',
    ownerBriefBeds: 'Bedrooms',
    ownerBriefCta: 'View Brief & Respond',
    ownerBriefFooter: (city: string, postcode: string) =>
      `You're receiving this because you're listed as an agent in ${city || postcode}. Owner contact details are not shared until you're instructed.`,
    hunterBriefSubject: (firstName: string, intent: string, areas: string) =>
      `New Search Brief — ${firstName} wants to ${intent} in ${areas}`,
    hunterBriefGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    hunterBriefIntro: (firstName: string, intent: string, areas: string) =>
      `A home hunter (${firstName}) is looking to ${intent} in ${areas} and has been matched with you on Yalla.House.`,
    hunterBriefLookingTo: 'Looking to',
    hunterBriefAreas: 'Areas',
    hunterBriefBudget: 'Budget',
    hunterBriefTypes: 'Types',
    hunterBriefBeds: 'Min. bedrooms',
    hunterBriefTimeline: 'Timeline',
    hunterBriefCta: 'View Brief & Respond',
    hunterBriefFooter: 'You\'re receiving this because your coverage area matches this hunter\'s search. Contact details are not shared until the hunter chooses to connect.',
    newViewingSubject: (title: string) => `New viewing request — ${title}`,
    newViewingGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    newViewingIntro: (title: string, city: string) =>
      `Someone has requested a viewing for your listing ${title} in ${city}.`,
    newViewingName: 'Name',
    newViewingEmail: 'Email',
    newViewingPhone: 'Phone',
    newViewingMessage: 'Message',
    newViewingCta: 'View Request',
    newViewingFooter: 'Reply directly to the buyer via email or phone, or confirm the request in your dashboard.',
    viewingConfirmedSubject: (title: string) => `Viewing confirmed — ${title}`,
    viewingConfirmedGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingConfirmedIntro: (title: string, city: string) =>
      `Good news! The owner has confirmed your viewing request for ${title} in ${city}.`,
    viewingConfirmedBody: 'The owner will contact you shortly to arrange a specific time.',
    viewingConfirmedCta: 'View My Requests',
    viewingConfirmedFooter: 'If you have questions, you can reply directly to the owner\'s email.',
    viewingDeclinedSubject: (title: string) => `Your viewing request for ${title}`,
    viewingDeclinedGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingDeclinedIntro: (title: string) =>
      `Unfortunately, the owner of the listing ${title} cannot offer a viewing at this time.`,
    viewingDeclinedBody: 'Check out more listings — perhaps you\'ll find the right one.',
    viewingDeclinedCta: 'View More Listings',
    agentInviteSubject: (type: string, city: string) => `New instruction opportunity — ${type} in ${city}`,
    agentInviteGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    agentInviteIntro: (city: string, postcode: string) =>
      `A property owner in ${city} (${postcode}) is looking for competing proposals from local agents.`,
    agentInviteArea: 'Area',
    agentInviteType: 'Type',
    agentInvitePrice: 'Asking Price',
    agentInviteBeds: 'Bedrooms',
    agentInviteDescription: 'Yalla.House connects motivated sellers with local agents — no upfront fees, no lock-in. The owner reviews proposals side by side and picks the best fit.',
    agentInviteCta: 'View Brief & Submit Your Proposal',
    agentInviteFooter: (postcode: string) =>
      `You're receiving this because you're listed as an estate agent covering ${postcode}. If this isn't relevant, simply ignore this email.`,
    viewingReminderSubject: (title: string, when: string) => `Viewing reminder — ${title} (${when})`,
    viewingReminderGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingReminderHunterIntro: (title: string, date: string) =>
      `Just a reminder: your viewing at ${title} is scheduled for ${date}.`,
    viewingReminderOwnerIntro: (title: string, date: string) =>
      `A viewing for ${title} is scheduled for ${date}.`,
    viewingReminderBody: 'Make sure you\'re ready. You can manage this viewing from your dashboard.',
    viewingReminderCta: 'View My Dashboard',
    viewingCheckInSubject: (title: string) => `How was the viewing? — ${title}`,
    viewingCheckInGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingCheckInIntro: (title: string) =>
      `We hope your viewing at ${title} went well! Let us know what you thought.`,
    viewingCheckInBody: 'Your feedback helps us improve the experience for everyone — and helps the owner understand your interest.',
    viewingCheckInCta: 'Leave Feedback',
    buy: 'buy',
    rent: 'rent',
    sale: 'For Sale',
    rental: 'To Rent',
    saleBoth: 'Sale & Rental',
    priceOnApplication: 'Price on application',
    rentOnApplication: 'Rent on application',
    pcm: 'pcm',
    welcomeSubject: 'Welcome to Yalla.House',
    welcomeGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    welcomeIntro: 'Your account is ready. Here\'s what you can do next.',
    welcomeQuickStart: 'Quick start guide',
    welcomeStep1: 'Post your property directly on Rightmove and Zoopla',
    welcomeStep2: 'Set your asking price (or let the market tell you)',
    welcomeStep3: 'Get offers from local agents',
    welcomeStep4: 'Keep every pound of your sale',
    welcomeDashboardLabel: 'Go to Your Dashboard',
    welcomeFooter: 'Questions? We\'re here to help.',
    assignmentSubject: (address: string) => `Assignment confirmed — ${address}`,
    assignmentGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    assignmentIntro: (agentName: string, address: string) =>
      `Good news! ${agentName} has accepted your instruction to sell ${address}.`,
    assignmentNextSteps: 'What happens next',
    assignmentStep1: 'Your agent will arrange a valuation visit',
    assignmentStep2: 'Property details and photos will be uploaded to portals',
    assignmentStep3: 'You\'ll start receiving buyer enquiries',
    assignmentStep4: 'Your agent handles negotiations and viewings',
    assignmentCommission: 'Commission',
    assignmentTerms: 'Terms',
    assignmentDashboard: 'View Assignment',
    assignmentFooter: 'You\'re in control — cancel anytime.',
    // Tiered agent invite translations
    tieredInviteSubject: (tier: string, city: string) => {
      const labels: Record<string, string> = {
        advisory: `Advisory collaboration opportunity — property in ${city}`,
        assisted: `Assisted collaboration opportunity — property in ${city}`,
        managed: `Full-service instruction opportunity — property in ${city}`,
      }
      return labels[tier] ?? `Collaboration opportunity — property in ${city}`
    },
    tieredInviteGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    // Advisory
    advisoryIntro: (ownerName: string) =>
      `${ownerName} has invited you to provide expert advisory support for the sale of their property through Yalla.House.`,
    advisoryScope: 'The owner is looking for guidance with:',
    advisoryScopeItems: [
      'pricing strategy and market positioning,',
      'marketing recommendations,',
      'and negotiation advice when offers come in.',
    ],
    advisoryOwnerNote: 'The owner will manage viewings, buyer enquiries, and day-to-day communication directly.',
    // Assisted
    assistedIntro: (ownerName: string) =>
      `${ownerName} has invited you to collaborate on the sale of their property through Yalla.House using the Assisted collaboration model.`,
    assistedScope: 'The owner is looking for support with:',
    assistedScopeItems: [
      'managing buyer enquiries,',
      'coordinating viewings,',
      'and handling day-to-day communication,',
    ],
    assistedOwnerNote: 'while retaining control over negotiation and final decision-making.',
    // Managed
    managedIntro: (ownerName: string) =>
      `${ownerName} has invited you to discuss a full-service sales collaboration through Yalla.House regarding the sale of their property.`,
    managedScope: 'The owner is currently exploring agent-led support for:',
    managedScopeItems: [
      'buyer communication,',
      'viewings,',
      'negotiation,',
      'and overall transaction management.',
    ],
    managedAgentActions: 'You can now:',
    managedAgentActionItems: [
      'review the property,',
      'communicate directly with the owner,',
      'discuss instruction structure,',
      'and manage collaboration through the workspace.',
    ],
    managedMultiAgent: 'The owner may be speaking with multiple agents before deciding how they would like to proceed.',
    // Shared tiered invite labels
    tieredPropertyOverview: 'Property Overview',
    tieredAddress: 'Address',
    tieredEstimatedValue: 'Estimated Value',
    tieredPropertyType: 'Property Type',
    tieredSellerTimeline: 'Seller Timeline',
    tieredViewingReadiness: 'Viewing Readiness',
    tieredListingStatus: 'Listing Status',
    tieredReady: 'Ready',
    tieredPreparing: 'Preparing',
    tieredWorkspaceIntro: 'The property workspace is already active within Yalla.House and includes:',
    tieredWorkspaceItems: [
      'the live property listing,',
      'media and property information,',
      'seller availability,',
      'buyer activity tracking,',
      'and structured communication tools.',
    ],
    tieredManagedWorkspaceIntro: 'A shared collaboration workspace has already been prepared within Yalla.House, including:',
    tieredManagedWorkspaceItems: [
      'the live property listing,',
      'property details and media,',
      'seller onboarding information,',
      'activity tracking,',
      'and communication history.',
    ],
    tieredTransparency: 'This allows both sides to collaborate transparently while keeping the process organised for the owner and interested buyers.',
    tieredCompetitorCount: (count: number) =>
      `You are currently one of ${count} agent${count === 1 ? '' : 's'} invited to participate.`,
    tieredCta: 'Open Listing & Collaboration Workspace',
    tieredSignoff: 'Best regards,',
    tieredTeam: 'The Yalla.House Team',
    tieredFooter: (postcode: string) =>
      `You're receiving this because you cover the ${postcode} area. If this isn't relevant, simply ignore this email.`,
    // Timeline/status labels
    timelineAsap: 'As soon as possible',
    timelineWithin3: 'Within 3 months',
    timelineWithin6: 'Within 6 months',
    timelineFlexible: 'Flexible',
    timelineNotSet: 'To be discussed',
    statusDraft: 'Preparing',
    statusPreview: 'Preparing',
    statusActive: 'Live',
    statusPaused: 'Paused',
    statusUnderOffer: 'Under Offer',
    statusLaunchingSoon: 'Launching Soon',
  },
  'de-DE': {
    ownerBriefSubject: 'Neuer Eigentümer-Brief',
    ownerBriefGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    ownerBriefIntro: (city: string, postcode: string) =>
      `Ein Immobilieneigentümer in ${city || postcode} hat dir über Yalla.House einen Eigentümer-Brief gesendet. Er sucht konkurrierende Angebote von lokalen Maklern.`,
    ownerBriefArea: 'Gebiet',
    ownerBriefType: 'Immobilientyp',
    ownerBriefPrice: 'Preis',
    ownerBriefBeds: 'Schlafzimmer',
    ownerBriefCta: 'Brief ansehen & antworten',
    ownerBriefFooter: (city: string, postcode: string) =>
      `Du erhältst diese E-Mail, weil du als Makler in ${city || postcode} registriert bist. Kontaktdaten des Eigentümers werden erst nach der Beauftragung weitergegeben.`,
    hunterBriefSubject: (firstName: string, intent: string, areas: string) =>
      `Neuer Such-Brief — ${firstName} möchte ${intent} in ${areas}`,
    hunterBriefGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    hunterBriefIntro: (firstName: string, intent: string, areas: string) =>
      `Ein Immobiliensuchender (${firstName}) möchte ${intent} in ${areas} und wurde mit dir bei Yalla.House abgeglichen.`,
    hunterBriefLookingTo: 'Sucht nach',
    hunterBriefAreas: 'Gebiete',
    hunterBriefBudget: 'Budget',
    hunterBriefTypes: 'Typen',
    hunterBriefBeds: 'Min. Schlafzimmer',
    hunterBriefTimeline: 'Zeitrahmen',
    hunterBriefCta: 'Brief ansehen & antworten',
    hunterBriefFooter: 'Du erhältst diese E-Mail, weil dein Abdeckungsgebiet zur Suche dieses Interessenten passt. Kontaktdaten werden erst nach Zustimmung weitergegeben.',
    newViewingSubject: (title: string) => `Neue Besichtigungsanfrage — ${title}`,
    newViewingGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    newViewingIntro: (title: string, city: string) =>
      `Jemand hat eine Besichtigung für dein Inserat ${title} in ${city} angefordert.`,
    newViewingName: 'Name',
    newViewingEmail: 'E-Mail',
    newViewingPhone: 'Telefon',
    newViewingMessage: 'Nachricht',
    newViewingCta: 'Anfrage ansehen',
    newViewingFooter: 'Antworte direkt dem Interessenten per E-Mail oder Telefon, oder bestätige die Anfrage in deinem Dashboard.',
    viewingConfirmedSubject: (title: string) => `Besichtigung bestätigt — ${title}`,
    viewingConfirmedGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingConfirmedIntro: (title: string, city: string) =>
      `Gute Neuigkeiten! Der Eigentümer hat deine Besichtigungsanfrage für ${title} in ${city} bestätigt.`,
    viewingConfirmedBody: 'Der Eigentümer wird sich in Kürze direkt bei dir melden, um einen Termin zu vereinbaren.',
    viewingConfirmedCta: 'Meine Anfragen ansehen',
    viewingConfirmedFooter: 'Falls du Fragen hast, kannst du direkt auf die E-Mail des Eigentümers antworten.',
    viewingDeclinedSubject: (title: string) => `Deine Besichtigungsanfrage für ${title}`,
    viewingDeclinedGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingDeclinedIntro: (title: string) =>
      `Leider kann der Eigentümer des Inserats ${title} zum aktuellen Zeitpunkt keine Besichtigung anbieten.`,
    viewingDeclinedBody: 'Schau dir weitere Inserate an — vielleicht ist das Passende dabei.',
    viewingDeclinedCta: 'Weitere Inserate ansehen',
    agentInviteSubject: (type: string, city: string) => `Neue Beauftragungsmöglichkeit — ${type} in ${city}`,
    agentInviteGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    agentInviteIntro: (city: string, postcode: string) =>
      `Ein Immobilieneigentümer in ${city} (${postcode}) sucht nach konkurrierenden Angeboten von lokalen Maklern.`,
    agentInviteArea: 'Gebiet',
    agentInviteType: 'Immobilientyp',
    agentInvitePrice: 'Angebotspreis',
    agentInviteBeds: 'Schlafzimmer',
    agentInviteDescription: 'Yalla.House verbindet motivierte Verkäufer mit lokalen Maklern — keine Vorabkosten, keine Bindung. Der Eigentümer vergleicht Angebote nebeneinander und wählt den besten aus.',
    agentInviteCta: 'Brief ansehen & dein Angebot einreichen',
    agentInviteFooter: (postcode: string) =>
      `Du erhältst diese E-Mail, weil du als Immobilienmakler in ${postcode} registriert bist. Falls das nicht relevant ist, ignoriere diese E-Mail einfach.`,
    viewingReminderSubject: (title: string, when: string) => `Besichtigungserinnerung — ${title} (${when})`,
    viewingReminderGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingReminderHunterIntro: (title: string, date: string) =>
      `Kurze Erinnerung: deine Besichtigung bei ${title} ist für ${date} geplant.`,
    viewingReminderOwnerIntro: (title: string, date: string) =>
      `Eine Besichtigung für ${title} ist für ${date} geplant.`,
    viewingReminderBody: 'Stell sicher, dass du bereit bist. Du kannst diese Besichtigung in deinem Dashboard verwalten.',
    viewingReminderCta: 'Mein Dashboard ansehen',
    viewingCheckInSubject: (title: string) => `Wie war die Besichtigung? — ${title}`,
    viewingCheckInGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingCheckInIntro: (title: string) =>
      `Wir hoffen, dass deine Besichtigung bei ${title} gut gelaufen ist! Lass uns wissen, was du davon hältst.`,
    viewingCheckInBody: 'Dein Feedback hilft uns, das Erlebnis für alle zu verbessern — und hilft dem Eigentümer, dein Interesse besser einzuschätzen.',
    viewingCheckInCta: 'Feedback geben',
    buy: 'kaufen',
    rent: 'mieten',
    sale: 'Zum Verkauf',
    rental: 'Zur Miete',
    saleBoth: 'Verkauf & Miete',
    priceOnApplication: 'Preis auf Anfrage',
    rentOnApplication: 'Miete auf Anfrage',
    pcm: 'p. M.',
    welcomeSubject: 'Willkommen bei Yalla.House',
    welcomeGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    welcomeIntro: 'Dein Konto ist bereit. Hier erfährst du, was du als Nächstes tun kannst.',
    welcomeQuickStart: 'Schnellstartanleitung',
    welcomeStep1: 'Stelle deine Immobilie direkt auf Immobilienportale',
    welcomeStep2: 'Lege deinen Angebotspreis fest (oder lasse den Markt sprechen)',
    welcomeStep3: 'Erhalte Angebote von lokalen Maklern',
    welcomeStep4: 'Behalte jeden Euro aus deinem Verkauf',
    welcomeDashboardLabel: 'Gehe zu deinem Dashboard',
    welcomeFooter: 'Fragen? Wir sind da, um dir zu helfen.',
    assignmentSubject: (address: string) => `Beauftragung bestätigt — ${address}`,
    assignmentGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    assignmentIntro: (agentName: string, address: string) =>
      `Gute Neuigkeiten! ${agentName} hat deine Beauftragung für den Verkauf von ${address} angenommen.`,
    assignmentNextSteps: 'Was kommt als Nächstes',
    assignmentStep1: 'Dein Makler wird einen Besichtigungstermin vereinbaren',
    assignmentStep2: 'Immobiliendetails und Fotos werden auf Portalen hochgeladen',
    assignmentStep3: 'Du erhältst Anfragen von potenziellen Käufern',
    assignmentStep4: 'Dein Makler kümmert sich um Verhandlungen und Besichtigungen',
    assignmentCommission: 'Provision',
    assignmentTerms: 'Bedingungen',
    assignmentDashboard: 'Beauftragung anzeigen',
    assignmentFooter: 'Du hast die Kontrolle — du kannst jederzeit kündigen.',
    // Tiered agent invite translations
    tieredInviteSubject: (tier: string, city: string) => {
      const labels: Record<string, string> = {
        advisory: `Beratungs-Kooperation — Immobilie in ${city}`,
        assisted: `Unterstützte Kooperation — Immobilie in ${city}`,
        managed: `Vollservice-Beauftragung — Immobilie in ${city}`,
      }
      return labels[tier] ?? `Kooperationsmöglichkeit — Immobilie in ${city}`
    },
    tieredInviteGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    // Advisory
    advisoryIntro: (ownerName: string) =>
      `${ownerName} hat Sie eingeladen, beratende Unterstützung beim Verkauf der Immobilie über Yalla.House zu leisten.`,
    advisoryScope: 'Der Eigentümer sucht Unterstützung bei:',
    advisoryScopeItems: [
      'Preisstrategie und Marktpositionierung,',
      'Marketingempfehlungen,',
      'und Verhandlungsberatung bei eingehenden Angeboten.',
    ],
    advisoryOwnerNote: 'Der Eigentümer wird Besichtigungen, Käuferanfragen und die alltägliche Kommunikation selbst verwalten.',
    // Assisted
    assistedIntro: (ownerName: string) =>
      `${ownerName} hat Sie eingeladen, beim Verkauf der Immobilie über Yalla.House im Modell „Unterstützte Zusammenarbeit“ mitzuwirken.`,
    assistedScope: 'Der Eigentümer sucht Unterstützung bei:',
    assistedScopeItems: [
      'der Verwaltung von Käuferanfragen,',
      'der Koordination von Besichtigungen,',
      'und der alltäglichen Kommunikation,',
    ],
    assistedOwnerNote: 'wobei die Kontrolle über Verhandlung und Endentscheidung beim Eigentümer verbleibt.',
    // Managed
    managedIntro: (ownerName: string) =>
      `${ownerName} hat Sie eingeladen, eine Vollservice-Zusammenarbeit beim Verkauf der Immobilie über Yalla.House zu besprechen.`,
    managedScope: 'Der Eigentümer sucht eine maklergestützte Betreuung für:',
    managedScopeItems: [
      'Käuferkommunikation,',
      'Besichtigungen,',
      'Verhandlungen,',
      'und das gesamte Transaktionsmanagement.',
    ],
    managedAgentActions: 'Sie können jetzt:',
    managedAgentActionItems: [
      'die Immobilie prüfen,',
      'direkt mit dem Eigentümer kommunizieren,',
      'die Beauftragungsstruktur besprechen,',
      'und die Zusammenarbeit über den Workspace verwalten.',
    ],
    managedMultiAgent: 'Der Eigentümer spricht möglicherweise mit mehreren Maklern, bevor eine Entscheidung getroffen wird.',
    // Shared tiered invite labels
    tieredPropertyOverview: 'Immobilienübersicht',
    tieredAddress: 'Adresse',
    tieredEstimatedValue: 'Geschätzter Wert',
    tieredPropertyType: 'Immobilientyp',
    tieredSellerTimeline: 'Verkäufer-Zeitrahmen',
    tieredViewingReadiness: 'Besichtigungsbereitschaft',
    tieredListingStatus: 'Inseratsstatus',
    tieredReady: 'Bereit',
    tieredPreparing: 'In Vorbereitung',
    tieredWorkspaceIntro: 'Der Immobilien-Workspace ist bereits aktiv auf Yalla.House und umfasst:',
    tieredWorkspaceItems: [
      'das aktuelle Immobilieninserat,',
      'Medien und Immobilieninformationen,',
      'Verfügbarkeit des Verkäufers,',
      'Käuferaktivitätsverfolgung,',
      'und strukturierte Kommunikationstools.',
    ],
    tieredManagedWorkspaceIntro: 'Ein gemeinsamer Kooperations-Workspace wurde bereits auf Yalla.House vorbereitet, einschließlich:',
    tieredManagedWorkspaceItems: [
      'das aktuelle Immobilieninserat,',
      'Immobiliendetails und Medien,',
      'Onboarding-Informationen des Verkäufers,',
      'Aktivitätsverfolgung,',
      'und Kommunikationsverlauf.',
    ],
    tieredTransparency: 'Dies ermöglicht beiden Seiten eine transparente Zusammenarbeit und hält den Prozess für den Eigentümer und interessierte Käufer organisiert.',
    tieredCompetitorCount: (count: number) =>
      `Sie sind derzeit einer von ${count} eingeladenen Makler${count === 1 ? '' : 'n'}.`,
    tieredCta: 'Inserat & Kooperations-Workspace öffnen',
    tieredSignoff: 'Mit freundlichen Grüßen,',
    tieredTeam: 'Das Yalla.House Team',
    tieredFooter: (postcode: string) =>
      `Sie erhalten diese E-Mail, weil Sie das Gebiet ${postcode} abdecken. Falls dies nicht relevant ist, ignorieren Sie diese E-Mail einfach.`,
    // Timeline/status labels
    timelineAsap: 'So bald wie möglich',
    timelineWithin3: 'Innerhalb von 3 Monaten',
    timelineWithin6: 'Innerhalb von 6 Monaten',
    timelineFlexible: 'Flexibel',
    timelineNotSet: 'Noch zu besprechen',
    statusDraft: 'In Vorbereitung',
    statusPreview: 'In Vorbereitung',
    statusActive: 'Live',
    statusPaused: 'Pausiert',
    statusUnderOffer: 'Unter Angebot',
    statusLaunchingSoon: 'Start in Kürze',
  },
}

type EmailLocale = 'en-GB' | 'de-DE'

function emailWrapper(content: string, countryCode: string = DEFAULT_COUNTRY): string {
  const config = getCountryConfig(countryCode)

  return `<!DOCTYPE html>
<html lang="${config.default_locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EDEEF2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <div style="background:#D4764E;padding:20px 32px;">
      <span style="font-size:20px;font-weight:800;color:#0F1117;letter-spacing:-.02em;">Yalla.House</span>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:20px 32px;background:#F5F5FA;border-top:1px solid #E2E4EB;">
      <p style="margin:0;font-size:12px;color:#999;">
        ${config.legal_entity} &mdash; ${config.legal_tagline}
      </p>
    </div>
  </div>
</body>
</html>`
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#D4764E;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">${label}</a>`
}

export async function sendOwnerBriefEmail(opts: {
  agentEmail: string
  agentName: string | null
  listingId: string
  propertyType: string
  intent: string
  city: string
  postcode: string
  bedrooms: number | null
  salePrice: number | null
  rentPrice: number | null
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.ownerBriefGreeting(opts.agentName?.split(' ')[0] ?? '')

  const isSale = opts.intent === 'sale' || opts.intent === 'both'
  const priceValue = isSale
    ? opts.salePrice
      ? formatCurrency(opts.salePrice, config.currency, locale)
      : t.priceOnApplication
    : opts.rentPrice
      ? `${formatCurrency(opts.rentPrice, config.currency, locale)} ${t.pcm}`
      : t.rentOnApplication

  const intentLabel = opts.intent === 'both'
    ? t.saleBoth
    : isSale ? t.sale : t.rental

  const bedroomsRow = opts.bedrooms != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.ownerBriefBeds}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedrooms}</td></tr>`
    : ''

  const typeLabels: Record<string, Record<string, string>> = {
    'en-GB': { house: 'House', flat: 'Flat', apartment: 'Apartment', villa: 'Villa', commercial: 'Commercial', land: 'Land', other: 'Property' },
    'de-DE': { house: 'Haus', flat: 'Wohnung', apartment: 'Apartment', villa: 'Villa', commercial: 'Gewerbe', land: 'Grundstück', other: 'Immobilie' },
  }

  const typeLabel = ((typeLabels[locale] ?? typeLabels['en-GB']) ?? {})[opts.propertyType] ?? 'Property'

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.ownerBriefIntro(opts.city, opts.postcode)}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.ownerBriefArea}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.city}${opts.postcode ? `, ${opts.postcode}` : ''}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.ownerBriefType}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${typeLabel}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${intentLabel}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${priceValue}</td></tr>
        ${bedroomsRow}
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:15px;color:#5E6278;">
      Sign in to your Yalla agent dashboard to view the full brief and submit your proposal. The owner will compare responses side by side.
    </p>

    ${ctaButton(t.ownerBriefCta, `${BASE_URL}/brief/${opts.listingId}`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.ownerBriefFooter(opts.city, opts.postcode)}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: `${t.ownerBriefSubject} — ${typeLabel} in ${opts.city || opts.postcode}`,
      html,
    })
  } catch (err) {
    console.error('sendOwnerBriefEmail failed:', err)
  }
}

export async function sendHunterBriefEmail(opts: {
  agentEmail: string
  agentName: string | null
  hunterFirstName: string
  intent: string
  areas: Array<{ name?: string }> | null
  budgetMin: number | null
  budgetMax: number | null
  currency: string
  propertyTypes: string[] | null
  bedroomsMin: number | null
  timeline: string | null
  matchId: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.hunterBriefGreeting(opts.agentName?.split(' ')[0] ?? '')

  const areaNames = (opts.areas ?? [])
    .map((a) => a.name)
    .filter(Boolean)
    .join(', ') || (locale === 'en-GB' ? 'your area' : 'dein Gebiet')

  const intentLabel = opts.intent === 'rent' ? t.rent : t.buy

  const formatBudget = (val: number | null): string => {
    if (!val) return '—'
    return formatCurrency(val, opts.currency, locale)
  }

  const budgetRow = (opts.budgetMin || opts.budgetMax)
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefBudget}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${formatBudget(opts.budgetMin)} – ${formatBudget(opts.budgetMax)}</td></tr>`
    : ''

  const typesRow = opts.propertyTypes && opts.propertyTypes.length > 0
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefTypes}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.propertyTypes.join(', ')}</td></tr>`
    : ''

  const bedsRow = opts.bedroomsMin != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefBeds}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedroomsMin}+</td></tr>`
    : ''

  const timelineRow = opts.timeline
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefTimeline}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.timeline}</td></tr>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.hunterBriefIntro(opts.hunterFirstName, intentLabel, areaNames)}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefLookingTo}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${intentLabel === t.rent ? (locale === 'en-GB' ? 'Rent' : 'Miete') : (locale === 'en-GB' ? 'Buy' : 'Kauf')}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefAreas}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${areaNames}</td></tr>
        ${budgetRow}
        ${typesRow}
        ${bedsRow}
        ${timelineRow}
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:15px;color:#5E6278;">
      Sign in to your agent dashboard to view the full brief and respond with suitable properties.
    </p>

    ${ctaButton(t.hunterBriefCta, `${BASE_URL}/agent/briefs`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.hunterBriefFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: t.hunterBriefSubject(opts.hunterFirstName, intentLabel, areaNames),
      html,
    })
  } catch (err) {
    console.error('sendHunterBriefEmail failed:', err)
  }
}

export async function sendNewViewingRequestEmail(opts: {
  ownerEmail: string
  ownerName: string | null
  listingTitle: string
  listingCity: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string | null
  buyerMessage: string | null
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.newViewingGreeting(opts.ownerName?.split(' ')[0] ?? '')

  const phoneRow = opts.buyerPhone
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.newViewingPhone}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.buyerPhone}</td></tr>`
    : ''

  const messageBlock = opts.buyerMessage
    ? `<div style="margin-top:20px;padding:16px;background:#F5F5FA;border-radius:10px;font-size:14px;color:#5E6278;font-style:italic;">&ldquo;${opts.buyerMessage}&rdquo;</div>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.newViewingIntro(opts.listingTitle, opts.listingCity)}
    </p>

    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.newViewingName}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.buyerName}</td></tr>
      <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.newViewingEmail}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;"><a href="mailto:${opts.buyerEmail}" style="color:#0F1117;">${opts.buyerEmail}</a></td></tr>
      ${phoneRow}
    </table>

    ${messageBlock}

    ${ctaButton(t.newViewingCta, `${BASE_URL}/owner/viewings`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.newViewingFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.ownerEmail,
      subject: t.newViewingSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendNewViewingRequestEmail failed:', err)
  }
}

export async function sendViewingConfirmedEmail(opts: {
  buyerEmail: string
  buyerName: string | null
  listingTitle: string
  listingCity: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingConfirmedGreeting(opts.buyerName?.split(' ')[0] ?? '')

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.viewingConfirmedIntro(opts.listingTitle, opts.listingCity)}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingConfirmedBody}
    </p>

    ${ctaButton(t.viewingConfirmedCta, `${BASE_URL}/hunter`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.viewingConfirmedFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.buyerEmail,
      subject: t.viewingConfirmedSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendViewingConfirmedEmail failed:', err)
  }
}

export async function sendViewingDeclinedEmail(opts: {
  buyerEmail: string
  buyerName: string | null
  listingTitle: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingDeclinedGreeting(opts.buyerName?.split(' ')[0] ?? '')

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.viewingDeclinedIntro(opts.listingTitle)}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingDeclinedBody}
    </p>

    ${ctaButton(t.viewingDeclinedCta, `${BASE_URL}/listings`)}
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.buyerEmail,
      subject: t.viewingDeclinedSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendViewingDeclinedEmail failed:', err)
  }
}

export async function sendAgentInviteEmail(opts: {
  agentEmail: string
  agencyName: string
  agentName: string | null
  listingCity: string
  listingPostcode: string
  propertyType: string
  bedrooms: number | null
  askingPrice: number | null
  listingId: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<{ success: boolean; error?: string }> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.agentInviteGreeting(opts.agentName?.split(' ')[0] ?? '')

  const typeLabels: Record<string, Record<string, string>> = {
    'en-GB': { house: 'House', flat: 'Flat', apartment: 'Apartment', villa: 'Villa', commercial: 'Commercial', land: 'Land', other: 'Property' },
    'de-DE': { house: 'Haus', flat: 'Wohnung', apartment: 'Apartment', villa: 'Villa', commercial: 'Gewerbe', land: 'Grundstück', other: 'Immobilie' },
  }

  const typeLabel = ((typeLabels[locale] ?? typeLabels['en-GB']) ?? {})[opts.propertyType] ?? 'Property'

  const bedroomsRow = opts.bedrooms != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInviteBeds}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedrooms}</td></tr>`
    : ''

  const priceValue = opts.askingPrice
    ? formatCurrency(opts.askingPrice, config.currency, locale)
    : t.priceOnApplication

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.agentInviteIntro(opts.listingCity, opts.listingPostcode)}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInviteArea}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.listingCity}, ${opts.listingPostcode}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInviteType}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${typeLabel}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInvitePrice}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${priceValue}</td></tr>
        ${bedroomsRow}
      </table>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#5E6278;">
      <strong style="color:#0F1117;">Yalla.House</strong> ${t.agentInviteDescription}
    </p>

    ${ctaButton(t.agentInviteCta, `${BASE_URL}/agent/briefs/${opts.listingId}`)}

    <div style="text-align:center;margin-top:12px;">
      <a href="${BASE_URL}/agent/listing/${opts.listingId}" style="display:inline-block;padding:10px 24px;background:#EDEEF2;color:#0F1117;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid #D8DBE5;">
        ${locale === 'en-GB' ? 'View Property Details' : 'Immobiliendetails ansehen'}
      </a>
    </div>

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.agentInviteFooter(opts.listingPostcode)}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: t.agentInviteSubject(typeLabel, opts.listingCity),
      html,
    })
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send email'
    console.error('sendAgentInviteEmail failed:', error)
    return { success: false, error }
  }
}

export type AgentInviteTier = 'advisory' | 'assisted' | 'managed'

export async function sendTieredAgentInviteEmail(opts: {
  agentEmail: string
  agentName: string | null
  ownerName: string | null
  tier: AgentInviteTier
  listingId: string
  address: string
  city: string
  postcode: string
  propertyType: string
  askingPrice: number | null
  currency: string
  timeline: string | null
  listingStatus: string
  competitorCount: number
  countryCode?: string
  locale?: EmailLocale
}): Promise<{ success: boolean; error?: string }> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const agentFirstName = opts.agentName?.split(' ')[0] ?? ''
  const greeting = t.tieredInviteGreeting(agentFirstName)
  const ownerDisplay = opts.ownerName ?? (locale === 'en-GB' ? 'A property owner' : 'Ein Immobilieneigentümer')

  // Resolve type label
  const typeLabels: Record<string, Record<string, string>> = {
    'en-GB': { house: 'House', flat: 'Flat', apartment: 'Apartment', villa: 'Villa', commercial: 'Commercial', land: 'Land', other: 'Property' },
    'de-DE': { house: 'Haus', flat: 'Wohnung', apartment: 'Apartment', villa: 'Villa', commercial: 'Gewerbe', land: 'Grundstück', other: 'Immobilie' },
  }
  const typeLabel = ((typeLabels[locale] ?? typeLabels['en-GB']) ?? {})[opts.propertyType] ?? (locale === 'en-GB' ? 'Property' : 'Immobilie')

  // Resolve price
  const priceValue = opts.askingPrice
    ? formatCurrency(opts.askingPrice, opts.currency || config.currency, locale)
    : t.priceOnApplication

  // Resolve timeline label
  const timelineLabels: Record<string, string> = {
    asap: t.timelineAsap,
    within_3_months: t.timelineWithin3,
    within_6_months: t.timelineWithin6,
    flexible: t.timelineFlexible,
  }
  const timelineLabel = opts.timeline
    ? (timelineLabels[opts.timeline] ?? opts.timeline)
    : t.timelineNotSet

  // Resolve listing status label
  const statusLabels: Record<string, string> = {
    draft: t.statusDraft,
    preview: t.statusPreview,
    active: t.statusActive,
    paused: t.statusPaused,
    under_offer: t.statusUnderOffer,
  }
  const statusLabel = statusLabels[opts.listingStatus] ?? t.statusLaunchingSoon

  // Viewing readiness: active/under_offer = Ready, otherwise Preparing
  const viewingReady = opts.listingStatus === 'active' || opts.listingStatus === 'under_offer'
  const viewingLabel = viewingReady ? t.tieredReady : t.tieredPreparing

  // Build tier-specific intro + scope section
  let introHtml = ''
  let scopeHtml = ''
  let workspaceHtml = ''
  let postScopeHtml = ''

  const buildList = (items: string[]) =>
    items.map(item => `<li style="margin-bottom:4px;">${item}</li>`).join('')

  if (opts.tier === 'advisory') {
    introHtml = `<p style="margin:0 0 16px;font-size:15px;color:#5E6278;">${t.advisoryIntro(ownerDisplay)}</p>`
    scopeHtml = `
      <p style="margin:0 0 8px;font-size:15px;color:#5E6278;">${t.advisoryScope}</p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#5E6278;line-height:1.7;">
        ${buildList(t.advisoryScopeItems)}
      </ul>
      <p style="margin:0 0 24px;font-size:14px;color:#999;font-style:italic;">${t.advisoryOwnerNote}</p>`
    workspaceHtml = `
      <p style="margin:0 0 8px;font-size:15px;color:#5E6278;">${t.tieredWorkspaceIntro}</p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#5E6278;line-height:1.7;">
        ${buildList(t.tieredWorkspaceItems)}
      </ul>
      <p style="margin:0 0 24px;font-size:14px;color:#5E6278;">${t.tieredTransparency}</p>`
  } else if (opts.tier === 'assisted') {
    introHtml = `<p style="margin:0 0 16px;font-size:15px;color:#5E6278;">${t.assistedIntro(ownerDisplay)}</p>`
    scopeHtml = `
      <p style="margin:0 0 8px;font-size:15px;color:#5E6278;">${t.assistedScope}</p>
      <ul style="margin:0 0 8px;padding-left:20px;font-size:14px;color:#5E6278;line-height:1.7;">
        ${buildList(t.assistedScopeItems)}
      </ul>
      <p style="margin:0 0 24px;font-size:14px;color:#5E6278;">${t.assistedOwnerNote}</p>`
    workspaceHtml = `
      <p style="margin:0 0 8px;font-size:15px;color:#5E6278;">${t.tieredWorkspaceIntro}</p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#5E6278;line-height:1.7;">
        ${buildList(t.tieredWorkspaceItems)}
      </ul>
      <p style="margin:0 0 24px;font-size:14px;color:#5E6278;">${t.tieredTransparency}</p>`
  } else {
    // managed
    introHtml = `<p style="margin:0 0 16px;font-size:15px;color:#5E6278;">${t.managedIntro(ownerDisplay)}</p>`
    scopeHtml = `
      <p style="margin:0 0 8px;font-size:15px;color:#5E6278;">${t.managedScope}</p>
      <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#5E6278;line-height:1.7;">
        ${buildList(t.managedScopeItems)}
      </ul>`
    workspaceHtml = `
      <p style="margin:0 0 8px;font-size:15px;color:#5E6278;">${t.tieredManagedWorkspaceIntro}</p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#5E6278;line-height:1.7;">
        ${buildList(t.tieredManagedWorkspaceItems)}
      </ul>`
    postScopeHtml = `
      <p style="margin:0 0 8px;font-size:15px;color:#5E6278;">${t.managedAgentActions}</p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#5E6278;line-height:1.7;">
        ${buildList(t.managedAgentActionItems)}
      </ul>
      <p style="margin:0 0 24px;font-size:14px;color:#999;font-style:italic;">${t.managedMultiAgent}</p>`
  }

  // Property overview card — Advisory/Assisted show Viewing Readiness, Managed shows Listing Status
  const lastRow = opts.tier === 'managed'
    ? `<tr><td style="padding:6px 0;color:#5E6278;font-size:14px;">${t.tieredListingStatus}</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;">${statusLabel}</td></tr>`
    : `<tr><td style="padding:6px 0;color:#5E6278;font-size:14px;">${t.tieredViewingReadiness}</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;">${viewingLabel}</td></tr>`

  const propertyCard = `
    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0F1117;text-transform:uppercase;letter-spacing:.04em;">
        ${t.tieredPropertyOverview}
      </h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#5E6278;font-size:14px;">${t.tieredAddress}</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;">${opts.address}</td></tr>
        <tr><td style="padding:6px 0;color:#5E6278;font-size:14px;">${t.tieredEstimatedValue}</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;">${priceValue}</td></tr>
        <tr><td style="padding:6px 0;color:#5E6278;font-size:14px;">${t.tieredPropertyType}</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;">${typeLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#5E6278;font-size:14px;">${t.tieredSellerTimeline}</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;">${timelineLabel}</td></tr>
        ${lastRow}
      </table>
    </div>`

  // Competitor count line
  const competitorLine = opts.competitorCount > 0
    ? `<p style="margin:0 0 24px;font-size:14px;color:#D4764E;font-weight:600;">${t.tieredCompetitorCount(opts.competitorCount)}</p>`
    : ''

  const workspaceUrl = `${BASE_URL}/agent/briefs/${opts.listingId}`

  const html = emailWrapper(`
    <p style="margin:0 0 12px;font-size:16px;color:#0F1117;">${greeting}</p>
    ${introHtml}
    ${scopeHtml}
    ${propertyCard}
    ${workspaceHtml}
    ${postScopeHtml}
    ${competitorLine}

    <div style="text-align:center;margin:24px 0;">
      ${ctaButton(t.tieredCta, workspaceUrl)}
    </div>

    <p style="margin:24px 0 4px;font-size:15px;color:#5E6278;">${t.tieredSignoff}</p>
    <p style="margin:0 0 24px;font-size:15px;font-weight:600;color:#0F1117;">${t.tieredTeam}</p>

    <p style="margin:0;font-size:13px;color:#999;">
      ${t.tieredFooter(opts.postcode)}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: t.tieredInviteSubject(opts.tier, opts.city || opts.postcode),
      html,
    })
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send tiered invite email'
    console.error('sendTieredAgentInviteEmail failed:', error)
    return { success: false, error }
  }
}

export async function sendViewingReminderEmail(opts: {
  recipientEmail: string
  recipientName: string | null
  listingTitle: string
  listingCity: string
  scheduledAt: string
  role: 'hunter' | 'owner'
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingReminderGreeting(opts.recipientName?.split(' ')[0] ?? '')
  const date = new Date(opts.scheduledAt).toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
  const when = new Date(opts.scheduledAt).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })

  const intro = opts.role === 'hunter'
    ? t.viewingReminderHunterIntro(opts.listingTitle, date)
    : t.viewingReminderOwnerIntro(opts.listingTitle, date)

  const dashboardUrl = opts.role === 'hunter' ? `${BASE_URL}/hunter` : `${BASE_URL}/owner/viewings`

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${intro}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingReminderBody}
    </p>

    ${ctaButton(t.viewingReminderCta, dashboardUrl)}
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.recipientEmail,
      subject: t.viewingReminderSubject(opts.listingTitle, when),
      html,
    })
  } catch (err) {
    console.error('sendViewingReminderEmail failed:', err)
  }
}

export async function sendViewingCheckInEmail(opts: {
  hunterEmail: string
  hunterName: string | null
  listingTitle: string
  viewingId: string
  locale?: EmailLocale
  countryCode?: string
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingCheckInGreeting(opts.hunterName?.split(' ')[0] ?? '')

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.viewingCheckInIntro(opts.listingTitle)}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingCheckInBody}
    </p>

    ${ctaButton(t.viewingCheckInCta, `${BASE_URL}/hunter/viewings/${opts.viewingId}/feedback`)}
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.hunterEmail,
      subject: t.viewingCheckInSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendViewingCheckInEmail failed:', err)
  }
}

export async function sendWelcomeEmail(opts: {
  userEmail: string
  userName: string | null
  userRole: 'owner' | 'hunter' | 'agent'
  countryCode?: string
  locale?: EmailLocale
}): Promise<{ success: boolean; error?: string }> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']

  const greeting = t.welcomeGreeting(opts.userName?.split(' ')[0] ?? '')

  let dashboardUrl: string
  if (opts.userRole === 'owner') {
    dashboardUrl = `${BASE_URL}/owner`
  } else if (opts.userRole === 'hunter') {
    dashboardUrl = `${BASE_URL}/hunter`
  } else {
    dashboardUrl = `${BASE_URL}/agent`
  }

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.welcomeIntro}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0F1117;">
        ${t.welcomeQuickStart}
      </h3>
      <ol style="margin:0;padding-left:20px;color:#5E6278;font-size:14px;line-height:1.8;">
        <li style="margin-bottom:8px;">${t.welcomeStep1}</li>
        <li style="margin-bottom:8px;">${t.welcomeStep2}</li>
        <li style="margin-bottom:8px;">${t.welcomeStep3}</li>
        <li>${t.welcomeStep4}</li>
      </ol>
    </div>

    ${ctaButton(t.welcomeDashboardLabel, dashboardUrl)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.welcomeFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.userEmail,
      subject: t.welcomeSubject,
      html,
    })
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send welcome email'
    console.error('sendWelcomeEmail failed:', error)
    return { success: false, error }
  }
}

export async function sendAssignmentAcceptedEmail(opts: {
  ownerEmail: string
  ownerName: string | null
  agentName: string
  address: string
  commission: number | null
  currency: string
  listingId: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<{ success: boolean; error?: string }> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.assignmentGreeting(opts.ownerName?.split(' ')[0] ?? '')
  const intro = t.assignmentIntro(opts.agentName, opts.address)

  const commissionRow = opts.commission != null
    ? `<tr><td style="padding:8px 0;color:#5E6278;font-size:14px;">${t.assignmentCommission}</td><td style="padding:8px 0 8px 16px;font-size:14px;font-weight:600;">${formatCurrency(opts.commission, opts.currency, locale)}</td></tr>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${intro}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0F1117;">
        ${t.assignmentNextSteps}
      </h3>
      <ol style="margin:0;padding-left:20px;color:#5E6278;font-size:14px;line-height:1.8;">
        <li style="margin-bottom:8px;">${t.assignmentStep1}</li>
        <li style="margin-bottom:8px;">${t.assignmentStep2}</li>
        <li style="margin-bottom:8px;">${t.assignmentStep3}</li>
        <li>${t.assignmentStep4}</li>
      </ol>
    </div>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#5E6278;font-size:14px;">${t.assignmentTerms}</td><td style="padding:8px 0 8px 16px;font-size:14px;font-weight:600;">${opts.agentName}</td></tr>
        ${commissionRow}
      </table>
    </div>

    ${ctaButton(t.assignmentDashboard, `${BASE_URL}/owner/listings/${opts.listingId}`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.assignmentFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.ownerEmail,
      subject: t.assignmentSubject(opts.address),
      html,
    })
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send assignment email'
    console.error('sendAssignmentAcceptedEmail failed:', error)
    return { success: false, error }
  }
}
