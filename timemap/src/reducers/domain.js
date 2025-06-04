import initial from "../store/initial.js";

import { UPDATE_DOMAIN, MARK_NOTIFICATIONS_READ } from "../actions";
import { validateDomain } from "./validate/validators.js";

function updateDomain(domainState, action) {
  console.log("Domain reducer: updateDomain called with:", action.payload);
  const validatedDomain = validateDomain(action.payload.domain, action.payload.features);
  console.log("Domain reducer: validated domain:", validatedDomain);
  console.log("Domain reducer: Events count after validation:", validatedDomain.events?.length || 0);
  
  return {
    ...domainState,
    ...validatedDomain,
  };
}

function markNotificationsRead(domainState, action) {
  return {
    ...domainState,
    notifications: domainState.notifications.map((n) => ({
      ...n,
      isRead: true,
    })),
  };
}

function domain(domainState = initial.domain, action) {
  switch (action.type) {
    case UPDATE_DOMAIN:
      return updateDomain(domainState, action);
    case MARK_NOTIFICATIONS_READ:
      return markNotificationsRead(domainState, action);
    default:
      return domainState;
  }
}

export default domain;
