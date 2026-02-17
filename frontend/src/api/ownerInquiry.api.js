import api from "./axios";

export const getAllInquiries = (status) => 
    api.get("/inquiries", { params: { status } });

export const updateInquiryStatus = (id, status) => 
    api.patch(`/inquiries/${id}`, { status });