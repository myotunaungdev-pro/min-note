import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, UploadCloud, CheckCircle, QrCode, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../context/SubscriptionContext';
import axiosInstance from '../../api/axiosConfig';
import usePageTitle from '../../hooks/usePageTitle';
import '../../components/settings/Settings.css';

const KPayCheckoutPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { markPaymentAsPending } = useSubscription();
    usePageTitle(t('kpay.title'));

    const searchParams = new URLSearchParams(location.search);
    const planType = searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly';

    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLightboxOpen]);

    const amount = planType === 'yearly' ? '335,000 Ks' : '35,000 Ks';

    const handleFileChange = (e) => {
        setError('');
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setError('');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async () => {
        if (!file) {
            setError(t('kpay.errorNoSlip'));
            return;
        }

        setIsSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('slip', file);
        formData.append('planType', planType);

        try {
            const response = await axiosInstance.post('/kpay-submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                markPaymentAsPending();
                navigate('/kpay-success');
            } else {
                setError(response.data.error || t('kpay.errorFailed'));
            }
        } catch (err) {
            setError(err.response?.data?.error || t('kpay.errorGeneral'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="settings-page min-h-screen bg-black text-white flex flex-col items-center p-2 sm:p-4 md:p-8">
            <div className="w-full max-w-2xl bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden mt-4 md:mt-8">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800 bg-[#141414]">
                    <h1 className="text-2xl font-semibold text-white">{t('kpay.title')}</h1>
                    <button 
                        onClick={() => navigate('/upgrade')}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-6 md:p-8">
                    <div className="space-y-8">
                        
                        <div className="text-center p-4 md:p-6 bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-2xl">
                                <p className="text-xs md:text-sm text-[#00d4aa] font-medium mb-1 md:mb-2 uppercase tracking-wider">{t('kpay.totalAmountDue')}</p>
                                <p className="text-4xl md:text-5xl font-bold text-white">{amount}</p>
                                <p className="text-xs md:text-sm text-gray-400 mt-2 md:mt-3">({planType === 'yearly' ? t('kpay.yearlyProPlan') : t('kpay.monthlyProPlan')})</p>
                            </div>

                            <div className="space-y-6">
                                <p className="text-gray-300 text-base md:text-lg leading-relaxed text-center px-2">
                                    {t('kpay.instruction')}
                                </p>
                                
                                <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 flex-shrink-0">
                                        <QrCode size={40} className="text-gray-500 md:w-12 md:h-12" />
                                    </div>
                                    <div className="flex flex-col space-y-1 md:space-y-2 text-center md:text-left">
                                        <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-wider">{t('kpay.accountNameTitle')}</p>
                                        <p className="text-xl md:text-2xl font-bold text-white">09123456789</p>
                                        <p className="text-sm md:text-md text-[#00d4aa]">{t('kpay.accountName')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-md font-medium text-gray-200">{t('kpay.uploadSlipTitle')}</p>
                                    {file ? (
                                        <div className="w-full h-auto min-h-[192px] border-2 border-[#00d4aa] bg-[#00d4aa]/5 rounded-2xl flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-200">
                                            <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-sm mx-auto">
                                                {/* Thumbnail Preview */}
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsLightboxOpen(true)}
                                                    className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-[#00d4aa]/30 bg-black shadow-xl group cursor-zoom-in"
                                                >
                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-1">
                                                        <span className="text-white text-[10px] font-medium leading-tight">{t('kpay.viewFullscreen', 'View Fullscreen')}</span>
                                                    </div>
                                                </button>
                                                
                                                {/* Upload Info & Actions */}
                                                <div className="flex flex-col items-center sm:items-start flex-1 w-full space-y-3">
                                                    <div className="flex items-center gap-2 text-[#00d4aa]">
                                                        <CheckCircle size={20} />
                                                        <span className="font-semibold text-sm">{t('kpay.uploadSuccess', 'File uploaded successfully')}</span>
                                                    </div>
                                                    <p className="text-gray-300 text-sm font-medium truncate w-full max-w-[150px] sm:max-w-[200px] text-center sm:text-left" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                        className="mt-1 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-xs font-medium border border-red-500/20"
                                                    >
                                                        <Trash2 size={16} /> {t('kpay.changeFile', 'Remove File')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <label 
                                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 border-gray-700 hover:border-gray-500 bg-[#111] hover:bg-[#1a1a1a]"
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                                <UploadCloud size={32} className="text-gray-400 mb-2 md:mb-3 md:w-10 md:h-10" />
                                                <p className="text-sm md:text-base text-gray-300 mb-1 md:mb-2"><span className="font-semibold text-[#00d4aa]">{t('kpay.clickToUpload')}</span> {t('kpay.orDragAndDrop')}</p>
                                                <p className="text-xs md:text-sm text-gray-500">{t('kpay.fileTypes')}</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    )}
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>

                        </div>
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-6 md:p-8 border-t border-gray-800 bg-[#141414]">
                    <button 
                        onClick={handleSubmit}
                        disabled={!file || isSubmitting}
                        className={`w-full py-3 md:py-4 px-6 text-base md:text-lg font-semibold rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all duration-200
                            ${(!file || isSubmitting) 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-[#00d4aa] hover:bg-[#00b390] text-black shadow-[0_0_15px_rgba(0,212,170,0.3)] hover:shadow-[0_0_20px_rgba(0,212,170,0.5)]'}
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('kpay.submitting')}
                            </>
                        ) : (
                            t('kpay.submitSlip')
                        )}
                    </button>
                </div>

                {/* Lightbox Modal */}
                {isLightboxOpen && file && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center cursor-default" onClick={e => e.stopPropagation()}>
                            <button 
                                onClick={() => setIsLightboxOpen(false)}
                                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                            <img 
                                src={URL.createObjectURL(file)} 
                                alt="Slip Fullscreen" 
                                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-gray-800" 
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default KPayCheckoutPage;
