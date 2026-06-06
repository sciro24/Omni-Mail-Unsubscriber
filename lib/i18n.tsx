"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LANGS = ["it", "en", "es", "fr"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_META: Record<Lang, { label: string; flag: string }> = {
  it: { label: "Italiano", flag: "🇮🇹" },
  en: { label: "English", flag: "🇬🇧" },
  es: { label: "Español", flag: "🇪🇸" },
  fr: { label: "Français", flag: "🇫🇷" },
};

export const LOCALE: Record<Lang, string> = {
  it: "it-IT",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

type Dict = Record<string, string>;

const it: Dict = {
  "brand": "Unsubscribe Manager",
  // landing
  "landing.tagline": "Trova e cancella tutte le newsletter dalla tua casella di posta in pochi secondi.",
  "landing.google": "Continua con Google",
  "landing.microsoft": "Continua con Microsoft",
  "landing.or": "oppure",
  "landing.privacy1": "Accede solo agli header delle email.",
  "landing.privacy2": "Nessun contenuto viene letto o archiviato.",
  "landing.feat1": "Scansione automatica",
  "landing.feat2": "Un click per mittente",
  "landing.feat3": "Solo metadata",
  "landing.language": "Lingua",
  "landing.github": "Codice su GitHub",
  // dashboard
  "dash.signout": "Esci",
  "dash.title": "Le tue mailing list",
  "dash.lastScan": "Ultima scansione: {time} · {n} mittenti trovati",
  "dash.reload": "Ricarica",
  "dash.reloading": "Ricarico…",
  "dash.tab.active": "Attive",
  "dash.tab.removed": "Rimosse",
  "dash.empty.active.title": "Tutto pulito!",
  "dash.empty.active.sub": "Nessuna mailing list attiva. Le disiscrizioni sono nella tab Rimosse.",
  "dash.empty.filter.title": "Nessun risultato",
  "dash.empty.filter.sub": "Nessuna mailing list in questa categoria o ricerca.",
  "dash.removed.count": "{n} disiscrizioni registrate nel tuo account.",
  "dash.removed.clear": "Svuota storico",
  "dash.empty.removed.title": "Ancora nessuna disiscrizione",
  "dash.empty.removed.sub": "Le newsletter da cui ti disiscrivi compariranno qui.",
  // toasts
  "toast.cloudFail": "⚠ Salvataggio storico sul cloud non riuscito (riprova il Ricarica)",
  "toast.resubscribe": "Apro la pagina di {name} per ri-iscriverti. Riportata tra le attive.",
  "toast.failOne": "✗ 1 disiscrizione fallita. Riprova.",
  "toast.failMany": "✗ {n} disiscrizioni fallite. Riprova.",
  // toolbar
  "toolbar.search": "Cerca mittente o email…",
  "toolbar.clearSearch": "Pulisci ricerca",
  "toolbar.total": "{n} totali",
  "toolbar.shown": "{shown} di {total}",
  // category cards
  "cat.all": "Tutte",
  "cat.promo": "Promozionali",
  "cat.useful": "Notifiche & utili",
  "cat.other": "Altre",
  "cat.sender": "mittente",
  "cat.senders": "mittenti",
  // bulk
  "bulk.selectedOne": "selezionata",
  "bulk.selectedMany": "selezionate",
  "bulk.deselect": "Deseleziona",
  "bulk.unsubAll": "Unsubscribe da tutte",
  // tables
  "tbl.sender": "Mittente",
  "tbl.email": "Email",
  "tbl.method": "Metodo",
  "tbl.lastEmail": "Ultima email",
  "tbl.unsubbed": "Disiscritto",
  "tbl.action": "Azione",
  "tbl.oldMail": "email vecchie in casella",
  "tbl.oldMail.title": "Email passate ancora in casella (normale: la disiscrizione blocca solo le nuove)",
  "tbl.verify": "Verifica",
  "tbl.verify.title": "Apre la pagina di disiscrizione del mittente per confermare l'esito",
  "tbl.resub": "Ri-iscriviti",
  "tbl.resub.title": "Apre la homepage del servizio per ri-iscriverti e riporta tra le attive",
  // action cell
  "act.done": "Fatto",
  "act.retry": "Errore · riprova",
  "act.retry.title": "Disiscrizione fallita — clicca per riprovare",
  "act.loading": "In corso",
  "act.unsub": "Unsubscribe",
  // loading
  "load.0": "Apro la tua casella…",
  "load.1": "Conto le newsletter…",
  "load.2": "Smisto promo e notifiche…",
  "load.3": "Cerco i mittenti più insistenti…",
  "load.4": "Quasi fatto, lucido i pulsanti…",
  // success modal
  "modal.titleOne": "Disiscritto correttamente!",
  "modal.titleMany": "{n} disiscrizioni completate!",
  "modal.subjectMany": "{n} newsletter",
  "modal.bodyOne": "{subject} è stata spostata nel tab {removed}.",
  "modal.bodyMany": "{subject} sono state spostate nel tab {removed}.",
  "modal.removed": "Rimosse",
  "modal.manualOne": "{n} richiede conferma: ho aperto la pagina del mittente nel browser. Completa/verifica lì.",
  "modal.manualMany": "{n} richiedono conferma: ho aperto le pagine del mittente nel browser. Completa/verifica lì.",
  "modal.continue": "Continua",
  "modal.goRemoved": "Vai a Rimosse",
  // relative dates
  "date.today": "oggi",
  "date.yesterday": "ieri",
  "date.daysAgo": "{n} giorni fa",
  "date.monthsAgo": "{n} mesi fa",
  "date.yearsAgo": "{n} anni fa",
};

const en: Dict = {
  "brand": "Unsubscribe Manager",
  "landing.tagline": "Find and remove every newsletter from your inbox in seconds.",
  "landing.google": "Continue with Google",
  "landing.microsoft": "Continue with Microsoft",
  "landing.or": "or",
  "landing.privacy1": "Only reads email headers.",
  "landing.privacy2": "No content is read or stored.",
  "landing.feat1": "Automatic scan",
  "landing.feat2": "One click per sender",
  "landing.feat3": "Metadata only",
  "landing.language": "Language",
  "landing.github": "Code on GitHub",
  "dash.signout": "Sign out",
  "dash.title": "Your mailing lists",
  "dash.lastScan": "Last scan: {time} · {n} senders found",
  "dash.reload": "Refresh",
  "dash.reloading": "Refreshing…",
  "dash.tab.active": "Active",
  "dash.tab.removed": "Removed",
  "dash.empty.active.title": "All clean!",
  "dash.empty.active.sub": "No active mailing lists. Unsubscribes are in the Removed tab.",
  "dash.empty.filter.title": "No results",
  "dash.empty.filter.sub": "No mailing list in this category or search.",
  "dash.removed.count": "{n} unsubscribes saved in your account.",
  "dash.removed.clear": "Clear history",
  "dash.empty.removed.title": "No unsubscribes yet",
  "dash.empty.removed.sub": "Newsletters you unsubscribe from will show up here.",
  "toast.cloudFail": "⚠ Could not save history to the cloud (try Refresh again)",
  "toast.resubscribe": "Opening {name}'s page to re-subscribe. Moved back to Active.",
  "toast.failOne": "✗ 1 unsubscribe failed. Try again.",
  "toast.failMany": "✗ {n} unsubscribes failed. Try again.",
  "toolbar.search": "Search sender or email…",
  "toolbar.clearSearch": "Clear search",
  "toolbar.total": "{n} total",
  "toolbar.shown": "{shown} of {total}",
  "cat.all": "All",
  "cat.promo": "Promotional",
  "cat.useful": "Alerts & useful",
  "cat.other": "Other",
  "cat.sender": "sender",
  "cat.senders": "senders",
  "bulk.selectedOne": "selected",
  "bulk.selectedMany": "selected",
  "bulk.deselect": "Deselect",
  "bulk.unsubAll": "Unsubscribe from all",
  "tbl.sender": "Sender",
  "tbl.email": "Email",
  "tbl.method": "Method",
  "tbl.lastEmail": "Last email",
  "tbl.unsubbed": "Unsubscribed",
  "tbl.action": "Action",
  "tbl.oldMail": "old mail in inbox",
  "tbl.oldMail.title": "Old emails still in inbox (normal: unsubscribing only stops new ones)",
  "tbl.verify": "Verify",
  "tbl.verify.title": "Opens the sender's unsubscribe page to confirm the result",
  "tbl.resub": "Re-subscribe",
  "tbl.resub.title": "Opens the service homepage to re-subscribe and moves it back to Active",
  "act.done": "Done",
  "act.retry": "Error · retry",
  "act.retry.title": "Unsubscribe failed — click to retry",
  "act.loading": "Working",
  "act.unsub": "Unsubscribe",
  "load.0": "Opening your inbox…",
  "load.1": "Counting newsletters…",
  "load.2": "Sorting promos and alerts…",
  "load.3": "Hunting the most persistent senders…",
  "load.4": "Almost done, polishing the buttons…",
  "modal.titleOne": "Unsubscribed successfully!",
  "modal.titleMany": "{n} unsubscribes completed!",
  "modal.subjectMany": "{n} newsletters",
  "modal.bodyOne": "{subject} has been moved to the {removed} tab.",
  "modal.bodyMany": "{subject} have been moved to the {removed} tab.",
  "modal.removed": "Removed",
  "modal.manualOne": "{n} needs confirmation: I opened the sender's page in your browser. Finish/verify there.",
  "modal.manualMany": "{n} need confirmation: I opened the senders' pages in your browser. Finish/verify there.",
  "modal.continue": "Continue",
  "modal.goRemoved": "Go to Removed",
  "date.today": "today",
  "date.yesterday": "yesterday",
  "date.daysAgo": "{n} days ago",
  "date.monthsAgo": "{n} months ago",
  "date.yearsAgo": "{n} years ago",
};

const es: Dict = {
  "brand": "Unsubscribe Manager",
  "landing.tagline": "Encuentra y elimina todos los boletines de tu bandeja en segundos.",
  "landing.google": "Continuar con Google",
  "landing.microsoft": "Continuar con Microsoft",
  "landing.or": "o",
  "landing.privacy1": "Solo accede a las cabeceras de los correos.",
  "landing.privacy2": "No se lee ni se almacena ningún contenido.",
  "landing.feat1": "Escaneo automático",
  "landing.feat2": "Un clic por remitente",
  "landing.feat3": "Solo metadatos",
  "landing.language": "Idioma",
  "landing.github": "Código en GitHub",
  "dash.signout": "Salir",
  "dash.title": "Tus listas de correo",
  "dash.lastScan": "Último escaneo: {time} · {n} remitentes encontrados",
  "dash.reload": "Actualizar",
  "dash.reloading": "Actualizando…",
  "dash.tab.active": "Activas",
  "dash.tab.removed": "Eliminadas",
  "dash.empty.active.title": "¡Todo limpio!",
  "dash.empty.active.sub": "No hay listas activas. Las bajas están en la pestaña Eliminadas.",
  "dash.empty.filter.title": "Sin resultados",
  "dash.empty.filter.sub": "Ninguna lista en esta categoría o búsqueda.",
  "dash.removed.count": "{n} bajas guardadas en tu cuenta.",
  "dash.removed.clear": "Vaciar historial",
  "dash.empty.removed.title": "Aún no hay bajas",
  "dash.empty.removed.sub": "Los boletines de los que te des de baja aparecerán aquí.",
  "toast.cloudFail": "⚠ No se pudo guardar el historial en la nube (prueba Actualizar otra vez)",
  "toast.resubscribe": "Abriendo la página de {name} para volver a suscribirte. Devuelta a Activas.",
  "toast.failOne": "✗ 1 baja fallida. Inténtalo de nuevo.",
  "toast.failMany": "✗ {n} bajas fallidas. Inténtalo de nuevo.",
  "toolbar.search": "Buscar remitente o correo…",
  "toolbar.clearSearch": "Limpiar búsqueda",
  "toolbar.total": "{n} en total",
  "toolbar.shown": "{shown} de {total}",
  "cat.all": "Todas",
  "cat.promo": "Promocionales",
  "cat.useful": "Avisos y útiles",
  "cat.other": "Otras",
  "cat.sender": "remitente",
  "cat.senders": "remitentes",
  "bulk.selectedOne": "seleccionada",
  "bulk.selectedMany": "seleccionadas",
  "bulk.deselect": "Deseleccionar",
  "bulk.unsubAll": "Darse de baja de todas",
  "tbl.sender": "Remitente",
  "tbl.email": "Correo",
  "tbl.method": "Método",
  "tbl.lastEmail": "Último correo",
  "tbl.unsubbed": "Dado de baja",
  "tbl.action": "Acción",
  "tbl.oldMail": "correos viejos en la bandeja",
  "tbl.oldMail.title": "Correos antiguos aún en la bandeja (normal: la baja solo detiene los nuevos)",
  "tbl.verify": "Verificar",
  "tbl.verify.title": "Abre la página de baja del remitente para confirmar el resultado",
  "tbl.resub": "Volver a suscribirse",
  "tbl.resub.title": "Abre la web del servicio para volver a suscribirte y la devuelve a Activas",
  "act.done": "Hecho",
  "act.retry": "Error · reintentar",
  "act.retry.title": "Baja fallida — haz clic para reintentar",
  "act.loading": "En curso",
  "act.unsub": "Darse de baja",
  "load.0": "Abriendo tu bandeja…",
  "load.1": "Contando boletines…",
  "load.2": "Clasificando promos y avisos…",
  "load.3": "Buscando los remitentes más insistentes…",
  "load.4": "Casi listo, puliendo los botones…",
  "modal.titleOne": "¡Baja realizada con éxito!",
  "modal.titleMany": "¡{n} bajas completadas!",
  "modal.subjectMany": "{n} boletines",
  "modal.bodyOne": "{subject} se ha movido a la pestaña {removed}.",
  "modal.bodyMany": "{subject} se han movido a la pestaña {removed}.",
  "modal.removed": "Eliminadas",
  "modal.manualOne": "{n} requiere confirmación: abrí la página del remitente en el navegador. Termina/verifica ahí.",
  "modal.manualMany": "{n} requieren confirmación: abrí las páginas del remitente en el navegador. Termina/verifica ahí.",
  "modal.continue": "Continuar",
  "modal.goRemoved": "Ir a Eliminadas",
  "date.today": "hoy",
  "date.yesterday": "ayer",
  "date.daysAgo": "hace {n} días",
  "date.monthsAgo": "hace {n} meses",
  "date.yearsAgo": "hace {n} años",
};

const fr: Dict = {
  "brand": "Unsubscribe Manager",
  "landing.tagline": "Trouvez et supprimez toutes les newsletters de votre boîte en quelques secondes.",
  "landing.google": "Continuer avec Google",
  "landing.microsoft": "Continuer avec Microsoft",
  "landing.or": "ou",
  "landing.privacy1": "Accède uniquement aux en-têtes des e-mails.",
  "landing.privacy2": "Aucun contenu n'est lu ni stocké.",
  "landing.feat1": "Analyse automatique",
  "landing.feat2": "Un clic par expéditeur",
  "landing.feat3": "Métadonnées uniquement",
  "landing.language": "Langue",
  "landing.github": "Code sur GitHub",
  "dash.signout": "Déconnexion",
  "dash.title": "Vos listes de diffusion",
  "dash.lastScan": "Dernière analyse : {time} · {n} expéditeurs trouvés",
  "dash.reload": "Actualiser",
  "dash.reloading": "Actualisation…",
  "dash.tab.active": "Actives",
  "dash.tab.removed": "Supprimées",
  "dash.empty.active.title": "Tout est propre !",
  "dash.empty.active.sub": "Aucune liste active. Les désinscriptions sont dans l'onglet Supprimées.",
  "dash.empty.filter.title": "Aucun résultat",
  "dash.empty.filter.sub": "Aucune liste dans cette catégorie ou recherche.",
  "dash.removed.count": "{n} désinscriptions enregistrées dans votre compte.",
  "dash.removed.clear": "Vider l'historique",
  "dash.empty.removed.title": "Aucune désinscription pour l'instant",
  "dash.empty.removed.sub": "Les newsletters dont vous vous désinscrivez apparaîtront ici.",
  "toast.cloudFail": "⚠ Échec de l'enregistrement de l'historique dans le cloud (réessayez Actualiser)",
  "toast.resubscribe": "Ouverture de la page de {name} pour vous réabonner. Remise dans Actives.",
  "toast.failOne": "✗ 1 désinscription échouée. Réessayez.",
  "toast.failMany": "✗ {n} désinscriptions échouées. Réessayez.",
  "toolbar.search": "Rechercher expéditeur ou e-mail…",
  "toolbar.clearSearch": "Effacer la recherche",
  "toolbar.total": "{n} au total",
  "toolbar.shown": "{shown} sur {total}",
  "cat.all": "Toutes",
  "cat.promo": "Promotionnelles",
  "cat.useful": "Alertes & utiles",
  "cat.other": "Autres",
  "cat.sender": "expéditeur",
  "cat.senders": "expéditeurs",
  "bulk.selectedOne": "sélectionnée",
  "bulk.selectedMany": "sélectionnées",
  "bulk.deselect": "Désélectionner",
  "bulk.unsubAll": "Se désinscrire de toutes",
  "tbl.sender": "Expéditeur",
  "tbl.email": "E-mail",
  "tbl.method": "Méthode",
  "tbl.lastEmail": "Dernier e-mail",
  "tbl.unsubbed": "Désinscrit",
  "tbl.action": "Action",
  "tbl.oldMail": "anciens e-mails en boîte",
  "tbl.oldMail.title": "Anciens e-mails encore en boîte (normal : la désinscription ne bloque que les nouveaux)",
  "tbl.verify": "Vérifier",
  "tbl.verify.title": "Ouvre la page de désinscription de l'expéditeur pour confirmer le résultat",
  "tbl.resub": "Se réabonner",
  "tbl.resub.title": "Ouvre le site du service pour vous réabonner et la remet dans Actives",
  "act.done": "Fait",
  "act.retry": "Erreur · réessayer",
  "act.retry.title": "Désinscription échouée — cliquez pour réessayer",
  "act.loading": "En cours",
  "act.unsub": "Se désinscrire",
  "load.0": "Ouverture de votre boîte…",
  "load.1": "Comptage des newsletters…",
  "load.2": "Tri des promos et alertes…",
  "load.3": "Recherche des expéditeurs les plus insistants…",
  "load.4": "Presque fini, on lustre les boutons…",
  "modal.titleOne": "Désinscription réussie !",
  "modal.titleMany": "{n} désinscriptions terminées !",
  "modal.subjectMany": "{n} newsletters",
  "modal.bodyOne": "{subject} a été déplacée dans l'onglet {removed}.",
  "modal.bodyMany": "{subject} ont été déplacées dans l'onglet {removed}.",
  "modal.removed": "Supprimées",
  "modal.manualOne": "{n} nécessite une confirmation : j'ai ouvert la page de l'expéditeur dans le navigateur. Terminez/vérifiez là.",
  "modal.manualMany": "{n} nécessitent une confirmation : j'ai ouvert les pages des expéditeurs dans le navigateur. Terminez/vérifiez là.",
  "modal.continue": "Continuer",
  "modal.goRemoved": "Aller à Supprimées",
  "date.today": "aujourd'hui",
  "date.yesterday": "hier",
  "date.daysAgo": "il y a {n} jours",
  "date.monthsAgo": "il y a {n} mois",
  "date.yearsAgo": "il y a {n} ans",
};

const DICT: Record<Lang, Dict> = { it, en, es, fr };

export type TFunc = (key: string, vars?: Record<string, string | number>) => string;

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: TFunc };

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_KEY = "um_lang";

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "it";
  const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (saved && LANGS.includes(saved)) return saved;
  const nav = window.navigator.language.slice(0, 2) as Lang;
  return LANGS.includes(nav) ? nav : "it";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("it");

  // Carica la lingua salvata dopo il mount (evita mismatch SSR/idratazione).
  useEffect(() => {
    setLangState(readStoredLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  };

  const t: TFunc = (key, vars) => interpolate(DICT[lang][key] ?? DICT.it[key] ?? key, vars);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n deve essere usato dentro <I18nProvider>");
  return ctx;
}

/** Helper date locale-aware, dipendono dalla lingua attiva. */
export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(LOCALE[lang], { day: "2-digit", month: "short", year: "numeric" });
}

export function relativeDate(iso: string, t: TFunc): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return t("date.today");
  if (days === 1) return t("date.yesterday");
  if (days < 30) return t("date.daysAgo", { n: days });
  if (days < 365) return t("date.monthsAgo", { n: Math.floor(days / 30) });
  return t("date.yearsAgo", { n: Math.floor(days / 365) });
}
