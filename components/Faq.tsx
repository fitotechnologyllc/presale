
import React, { useState, useEffect } from 'react';
import { FaqItem } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { FITOCHAIN_NETWORK } from '../constants';

const FaqAccordion: React.FC<{ item: FaqItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-slate-200">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-5 px-6"
            >
                <h3 className="text-lg font-medium text-slate-800">{item.question}</h3>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`accordion-content ${isOpen ? 'accordion-content-open' : ''}`}>
                <div className="px-6 pb-5">
                    <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

const Faq: React.FC = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/generateFaq', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ networkInfo: FITOCHAIN_NETWORK }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch FAQs.');
                }

                const content = await response.json();
                setFaqs(content);
            } catch (err: any) {
                console.error("Error fetching FAQ content:", err);
                setError(err.message || "Could not load FAQs. Please try again later.");
                // Fallback content on error
                 setFaqs([
                    { question: "What is Fitochain?", answer: "Fitochain is a revolutionary blockchain for the fitness industry. There was an error fetching dynamic content." },
                    { question: "How can I participate in the presale?", answer: "Connect your wallet, enter the amount you wish to contribute, and confirm the transaction." },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
                <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                    {loading ? (
                         <div className="p-8 text-center text-slate-500">Loading FAQs...</div>
                    ) : error ? (
                         <div className="p-8 text-center text-red-500">{error}</div>
                    ) : (
                        faqs.map((faq, index) => (
                            <FaqAccordion
                                key={index}
                                item={faq}
                                isOpen={openIndex === index}
                                onClick={() => handleToggle(index)}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default Faq;