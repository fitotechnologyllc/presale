import React from 'react';
import { PRESALE_HARD_CAP_ETH, PRESALE_TIERS } from '../constants';

interface PresaleProgressProps {
    raisedAmount: number;
    participants: number;
}

const PresaleProgress: React.FC<PresaleProgressProps> = ({ raisedAmount, participants }) => {
    const totalTierPercentage = PRESALE_TIERS.reduce((sum, tier) => sum + tier.percentage, 0);
    const presaleGoalEth = PRESALE_HARD_CAP_ETH * (totalTierPercentage / 100);
    const progressPercentage = Math.min((raisedAmount / presaleGoalEth) * 100, 100);

    let filledAmount = 0;

    return (
        <div className="w-full bg-slate-100 rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-1 text-slate-600 font-medium">
                <span>Progress ({progressPercentage.toFixed(2)}%)</span>
                <span className="text-slate-600">
                    Participants: <span className="font-bold text-slate-800">{participants.toLocaleString()}</span>
                </span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-5 flex overflow-hidden my-2">
                {PRESALE_TIERS.map((tier, index) => {
                    const tierWidth = tier.percentage * (100 / totalTierPercentage);
                    const tierStart = filledAmount;
                    filledAmount += tierWidth;
                    
                    let filledWidth = 0;
                    if (progressPercentage > tierStart) {
                        filledWidth = Math.min(progressPercentage - tierStart, tierWidth);
                    }
                    
                    return (
                        <div key={index} style={{ width: `${tierWidth}%`}} className="relative h-full bg-slate-200">
                            <div style={{ width: `${(filledWidth / tierWidth) * 100}%` }} className={`h-full ${tier.color} rounded-r-full`}></div>
                        </div>
                    );
                })}
            </div>

             <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                {PRESALE_TIERS.map((tier, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${tier.color}`}></div>
                        <span>{tier.name}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-slate-500">Raised: <span className="text-slate-800 font-semibold">{raisedAmount.toFixed(2)} ETH</span></span>
                <span className="text-slate-500">Goal: <span className="text-slate-800 font-semibold">{presaleGoalEth} ETH</span></span>
            </div>
        </div>
    );
};

export default PresaleProgress;