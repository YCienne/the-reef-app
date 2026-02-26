import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const initializePaystackPayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/paystack/initialize`,
            paymentData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if auth is needed
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Paystack Initialize Error:", error);
        throw error;
    }
};

export const verifyPaystackPayment = async (reference) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/paystack/verify`,
            { reference },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Paystack Verify Error:", error);
        throw error;
    }
};
