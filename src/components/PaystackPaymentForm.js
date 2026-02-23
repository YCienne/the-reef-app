import React, { useState } from 'react';
import { initializePaystackPayment } from '../services/paystackServices';

const PaystackPaymentForm = ({ amount, email, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const data = await initializePaystackPayment({ amount, email });
            if (data.status && data.data.authorization_url) {
                // Redirect to Paystack
                window.location.href = data.data.authorization_url;
            } else {
                alert('Payment initialization failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Error initializing payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ marginBottom: '15px' }}>Total to pay: <strong>GHS {amount}</strong></p>
            <button
                onClick={handlePayment}
                className="btn btn-accent"
                disabled={loading}
                style={{ width: '100%', padding: '12px' }}
            >
                {loading ? 'Processing...' : 'Pay Now with Paystack'}
            </button>
            {onClose && (
                <button
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{ marginTop: '10px', width: '100%', padding: '10px' }}
                >
                    Cancel
                </button>
            )}
        </div>
    );
};

export default PaystackPaymentForm;
