import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import '../../components/settings/Settings.css';

const KPaySuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    usePageTitle(t('kpaySuccess.pageTitle'));

    return (
        <div className="settings-page min-h-screen bg-black text-white flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">
            <div className="w-full max-w-lg bg-[#1a1a1a] border border-gray-800 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 text-center flex flex-col items-center space-y-4 md:space-y-6">
                
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-[#00d4aa]/20 blur-xl rounded-full" />
                    <CheckCircle size={80} className="text-[#00d4aa] relative" />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t('kpaySuccess.title')}</h1>
                
                <p className="text-gray-300 text-base md:text-lg leading-relaxed px-2">
                    {t('kpaySuccess.desc1')}<span className="text-[#00d4aa] font-semibold">{t('kpaySuccess.descPro')}</span>{t('kpaySuccess.desc2')}
                </p>
                
                <button 
                    onClick={() => navigate('/notes')}
                    className="mt-8 w-full py-4 px-6 text-lg font-semibold bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors shadow-lg"
                >
                    {t('kpaySuccess.returnBtn')}
                </button>
            </div>
        </div>
    );
};

export default KPaySuccess;
