import React from 'react';
import { TimelineStep } from '../types';

const timelineData: TimelineStep[] = [
    {
        date: "Phase 1: Community & Public Launch",
        title: "Fitochain Mainnet & Presale",
        description: [
            "Fitochain Mainnet Release: Open, decentralized, and EVM-compatible Layer 1 blockchain goes live.",
            "FITO Presale: Community and investor sale of the native coin (FITO), distributed in three tiers."
        ],
    },
    {
        date: "Phase 2: Core Product Releases",
        title: "DeFi & Tokenization Tools",
        description: [
            "DeFi Fito (DEX): AI-powered decentralized exchange launches, enabling fast, secure, low-fee trading.",
            "Fito Tokenpad: AI-integrated, no-code token creator and launchpad platform goes live for all users."
        ],
    },
    {
        date: "Phase 3: Ecosystem Expansion",
        title: "Future Utilities",
        description: "Future releases may include Fito Audit (contract security), Fito Drive (mobility), FitoPay (borderless payments), and Fito University (education). Release dates will be announced as development milestones are achieved.",
    },
];


const Timeline: React.FC = () => {
    return (
        <section className="bg-slate-50 py-16 md:py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Project Roadmap</h2>
                <div className="relative max-w-4xl mx-auto">
                    {/* The connecting line */}
                    <div className="absolute left-1/2 top-4 h-full w-0.5 bg-slate-200 -translate-x-1/2"></div>

                    {timelineData.map((step, index) => (
                        <div key={index} className="relative flex items-center mb-12 last:mb-0">
                            <div className={`flex w-full items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-lg">
                                        <p className="text-green-600 font-semibold mb-1">{step.date}</p>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                        {Array.isArray(step.description) ? (
                                            <ul className="space-y-2 text-slate-600 text-left">
                                                {step.description.map((item, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <svg className="w-4 h-4 mr-2 mt-1 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-slate-600">{step.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* The circle on the line */}
                            <div className="absolute left-1/2 -translate-x-1/2 bg-white w-8 h-8 rounded-full border-4 border-green-500 flex items-center justify-center">
                                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Timeline;