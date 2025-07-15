import React from 'react';

interface AdminControlsProps {
    isForceActive: boolean;
    isPaused: boolean;
    setForceActivate: (isActive: boolean) => Promise<void>;
    setPause: (isPaused: boolean) => Promise<void>;
    tx: {
        loading: boolean;
        error: string | null;
    }
}

const AdminControls: React.FC<AdminControlsProps> = ({ isForceActive, isPaused, setForceActivate, setPause, tx }) => {
    
    const isButtonDisabled = tx.loading;

    return (
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg p-4 mt-8 text-sm">
            <h4 className="text-lg font-bold text-indigo-800 mb-3 text-center">Admin Controls</h4>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                    onClick={() => setForceActivate(!isForceActive)}
                    disabled={isButtonDisabled}
                    className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition-colors disabled:bg-slate-400 disabled:cursor-wait ${
                        isForceActive
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    {isButtonDisabled ? 'Processing...' : isForceActive ? 'Deactivate Force Start' : 'Force Start Presale'}
                </button>
                <button
                    onClick={() => setPause(!isPaused)}
                    disabled={isButtonDisabled}
                    className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition-colors disabled:bg-slate-400 disabled:cursor-wait ${
                        isPaused
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                >
                    {isButtonDisabled ? 'Processing...' : isPaused ? 'Resume Presale' : 'Pause Presale'}
                </button>
            </div>
            {tx.error && <p className="text-center text-red-500 mt-2 text-xs">{tx.error}</p>}
            <p className="text-center text-indigo-600 mt-3 text-xs">
                Status: Force Start {isForceActive ? 'Enabled' : 'Disabled'} | Presale {isPaused ? 'Paused' : 'Running'}.
            </p>
        </div>
    );
};

export default AdminControls;
