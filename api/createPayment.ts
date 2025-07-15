
export const config = {
  runtime: 'edge',
};

const API_URL = 'https://api.nowpayments.io/v1/payment';

interface NowPaymentsResponse {
    invoice_url: string;
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { NOWPAYMENTS_API_KEY } = process.env;

    if (!NOWPAYMENTS_API_KEY) {
        console.error("NOWPayments API key is not configured on server.");
        return new Response(JSON.stringify({ message: 'Payment service is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { ethAmount, payoutAddress } = await req.json();

        if (typeof ethAmount !== 'number' || typeof payoutAddress !== 'string' || ethAmount <= 0) {
            return new Response(JSON.stringify({ message: 'Invalid input provided.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: ethAmount,
                price_currency: 'eth',
                pay_currency: 'usd',
                payout_address: payoutAddress,
                payout_currency: 'eth',
                payout_extra_id: `fito_presale_onramp_${payoutAddress}`,
                fixed_rate: true,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("NOWPayments API Error:", data);
            throw new Error(data.message || 'Failed to create payment link.');
        }

        const paymentData = data as NowPaymentsResponse;
        return new Response(JSON.stringify({ paymentUrl: paymentData.invoice_url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error creating NOWPayments payment:', error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}