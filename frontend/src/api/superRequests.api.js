import axios from "./axios";

export const getPendingRequests = () => 
  axios.get("/super/requests");


export const approveRequest = (requestId, payload) => 
  axios.post(`/super/requests/${requestId}/approve`, payload);




export const rejectRequest = (requestId, adminNotes) => 
  axios.post(`/super/requests/${requestId}/reject`, { admin_notes: adminNotes });