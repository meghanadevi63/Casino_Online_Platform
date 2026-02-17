import api from "./axios";

export const sendPartnerRequest = (data) => {
    
    return api.post("/inquiries/partner-request", {
        name: data.name,
        email: data.email,
        company_name: data.company, 
        message: data.message
    });
};