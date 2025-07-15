
const API_URL = 'https://api.nowpayments.io/v1/payment';
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

interface NowPaymentsResponse {
    payment_id: string;
    invoice_id: string;
    invoice_url: string;
    // There are other fields, but we only need the invoice_url
}

/**
 * Creates a fiat-to-crypto payment using NOWPayments API.
 * This will generate a payment link for the user to buy ETH with their card.
 * @param ethAmount The amount of ETH the user wants to purchase.
 * @param payoutAddress The user's wallet address where the ETH will be sent.
 * @returns The URL for the NOWPayments checkout page, or null if an error occurs.
 */
export const createFiatPayment = async (ethAmount: number, payoutAddress: string): Promise<string | null> => {
    if (!NOWPAYMENTS_API_KEY) {
        console.error("NOWPayments API key is not configured. Please set NOWPAYMENTS_API_KEY environment variable.");
        return null;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: ethAmount,
                price_currency: 'eth',
                pay_currency: 'usd', // User pays with fiat, USD is a common choice
                payout_address: payoutAddress,
                payout_currency: 'eth',
                payout_extra_id: `fito_presale_onramp_${payoutAddress}`, // Optional metadata
                fixed_rate: true,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("NOWPayments API Error:", data);
            throw new Error(data.message || 'Failed to create payment link.');
        }

        const paymentData = data as NowPaymentsResponse;
        return paymentData.invoice_url;

    } catch (error) {
        console.error('Error creating NOWPayments payment:', error);
        return null;
    }
};