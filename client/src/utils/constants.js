export const HOST = import.meta.env.VITE_SERVER_URL;

//AUTH ROUTES
export const AUTH_ROUTES = `${HOST}/api/auth`
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`
export const GET_ALL_USERS = `${AUTH_ROUTES}/user`
export const LOGOUT_USER  = `${AUTH_ROUTES}/logout`
export const UPDATE_USER_ROLE = (userId) => `${AUTH_ROUTES}/user/${userId}/role`
export const TOGGLE_USER_STATUS = (userId) => `${AUTH_ROUTES}/user/${userId}/status`


// UPLOAD ROUTES
export const UPLOAD_ROUTES = `${HOST}/api/uploads`
export const UPLOAD_PREVIEW = `${UPLOAD_ROUTES}/preview`
export const UPLOAD_MAPPING = `${UPLOAD_ROUTES}/map`
export const GET_ALL_JOBS = `${UPLOAD_ROUTES}/upload-jobs`
export const GET_UPLOAD_JOB_BY_ID = (uploadJobId) =>
  `${UPLOAD_ROUTES}/upload-jobs/${uploadJobId}`


// RECONCILIATION ROUTES
export const RECONCILIATION_ROUTES = `${HOST}/api/reconciliation`
export const GET_RECONCILIATION_DATA = `${RECONCILIATION_ROUTES}/GetReconciliationData`
export const GET_GLOBAL_RECONCILIATION_DATA = `${RECONCILIATION_ROUTES}/global-summary`
export const GET_RECONCILIATION_BY_JOB_ID = (uploadJobId) =>
  `${RECONCILIATION_ROUTES}/GetReconciliationDataById/${uploadJobId}`
export const MANUAL_CORRECT_RECORD = (recordId) =>
  `${RECONCILIATION_ROUTES}/records/${recordId}/manual-correction`

// AUDIT ROUTES
export const AUDIT_ROUTES = `${HOST}/api/audit`
export const GET_RECORD_AUDIT_TIMELINE = (recordId) =>
  `${AUDIT_ROUTES}/record/${recordId}/timeline`
export const GET_AUDIT_LOGS = `${AUDIT_ROUTES}/logs`

// RECORD ROUTES
export const RECORD_ROUTES = `${HOST}/api/record`
export const GET_RECORDS = `${RECORD_ROUTES}`
export const UPDATE_RECORD = (recordId) => `${RECORD_ROUTES}/${recordId}`
export const DELETE_RECORD = (recordId) => `${RECORD_ROUTES}/${recordId}`



