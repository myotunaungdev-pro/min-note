import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import '../../components/settings/Settings.css';

const KPaySuccess = () => {
    const navigate = useNavigate();
    usePageTitle('Payment Proof Received');

    return (
        <div className="settings-page min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-lg bg-[#1a1a1a] border border-gray-800 rounded-3xl shadow-2xl p-10 text-center flex flex-col items-center space-y-6">
                
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-[#00d4aa]/20 blur-xl rounded-full" />
                    <CheckCircle size={80} className="text-[#00d4aa] relative" />
                </div>
                
                <h1 className="text-3xl font-bold text-white tracking-tight">Payment Proof Received!</h1>
                
                <p className="text-gray-300 text-lg leading-relaxed px-2">
                    We are manually verifying your transaction. Your account will be upgraded to <span className="text-[#00d4aa] font-semibold">Pro</span> within 24 hours once approved. You will receive an email notification.
                </p>
                
                <button 
                    onClick={() => navigate('/notes')}
                    className="mt-8 w-full py-4 px-6 text-lg font-semibold bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors shadow-lg"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default KPaySuccess;
