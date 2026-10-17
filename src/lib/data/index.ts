/**
 * Backwards-compatible surface for the data layer.
 *
 * The accessors now live in one module per resource, so a per-resource change
 * is reviewable on its own. This barrel re-exports exactly the surface the
 * previous single `data.ts` module had, so existing callers keep working;
 * new code should import from the resource module it actually needs.
 */

export { getEvents, getUpcomingEvents, getPastEvents, getEventById, saveEvent, deleteEvent } from "./events";
export { saveRsvp, getRsvpsByEvent } from "./rsvps";
export { getMinutes, getMinutesById, saveMinutes, deleteMinutes } from "./minutes";
export {
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  saveAnnouncement,
  deleteAnnouncement,
} from "./announcements";
export { getArticles, getPublishedArticles, getArticleById, saveArticle, deleteArticle } from "./articles";
export { getPolicies, getPolicyById, savePolicy, deletePolicy } from "./policies";
export { getTeamMembers, getTeamMemberById, saveTeamMember, deleteTeamMember } from "./teamMembers";
export { getSubscribers, saveSubscriber, deleteSubscriber } from "./subscribers";
export { getSchoolSettings, saveSchoolSettings } from "./settings";
