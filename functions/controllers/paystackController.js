const axios = require('axios');
const admin = require('firebase-admin');
const db = admin.firestore();

// Helper function to detect mobile money provider from phone number
function getProviderFromPhone(phone) {
    const cleanPhone = phone.replace('+', '').replace(/\s/g, '');

    // Ghana numbers
    if (cleanPhone.startsWith('233')) {
        const prefix = cleanPhone.substring(3, 6);
        if (['24', '54', '59', '55'].includes(prefix)) {
            return 'mtn';
        } else if (['20', '50'].includes(prefix)) {
            return 'vod';
        } else if (['27', '57'].includes(prefix)) {
            return 'tgo';
        }
    }

    // Default to MTN if cannot determine
    return 'mtn';
}

// Helper function to update order status in database
async function updateOrderStatus(reference, status) {
    try {
        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef.where('reference', '==', reference).get();

        if (!snapshot.empty) {
            // Update existing
            const doc = snapshot.docs[0];
            await doc.ref.update({ status: status });
            console.log(`Order ${reference} updated to ${status}`);
        } else {
            console.log(`Order ${reference} not found, creating new record`);
            await ordersRef.add({
                reference,
                status,
                amount: 0, // Placeholder
                email: 'unknown@example.com', // Placeholder
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

// Initialize Paystack payment
const initializePayment = async (req, res) => {
    try {
        const { amount, email, phone, currency = 'GHS' } = req.body;

        // Convert amount to pesewas (smallest currency unit)
        const amountInPesewas = Math.round(amount * 100);

        const payload = {
            email: email,
            amount: amountInPesewas.toString(),
            currency: currency,
            mobile_money: {
                phone: phone.replace('+', ''), // Remove + if present
                provider: getProviderFromPhone(phone) // Auto-detect provider
            },
            metadata: {
                custom_fields: [
                    {
                        display_name: "Customer Name",
                        variable_name: "customer_name",
                        value: req.user?.name || "Customer"
                    },
                    {
                        display_name: "Phone Number",
                        variable_name: "phone_number",
                        value: phone
                    }
                ]
            },
            // Update this callback URL to point to your deployed function or frontend
            // callback_url: `${process.env.FRONTEND_URL}/payment-verify` 
            // Better to let frontend handle verify call after redirect
        };

        const response = await axios.post(
            'https://api.paystack.co/charge',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            data: response.data.data,
            message: 'Payment initialized successfully'
        });
    } catch (error) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Payment initialization failed',
            error: error.response?.data?.message || error.message
        });
    }
};

// Verify Paystack payment
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.body;

        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const paymentData = response.data.data;

        if (paymentData.status === 'success') {
            // Payment successful - update your database
            await updateOrderStatus(paymentData.reference, 'completed');

            res.json({
                success: true,
                data: paymentData,
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: `Payment failed: ${paymentData.gateway_response}`,
                data: paymentData
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed'
        });
    }
};

// Submit OTP for MoMo payment
const submitOTP = async (req, res) => {
    try {
        const { reference, otp } = req.body;

        const response = await axios.post(
            'https://api.paystack.co/charge/submit_otp',
            {
                reference: reference,
                otp: otp
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            data: response.data.data,
            message: 'OTP submitted successfully'
        });
    } catch (error) {
        console.error('OTP submission error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'OTP submission failed',
            error: error.response?.data?.message || error.message
        });
    }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status'
        });
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
    submitOTP,
    checkPaymentStatus
};
