import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, UploadCloud, CheckCircle, QrCode } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import usePageTitle from '../../hooks/usePageTitle';
import '../../components/settings/Settings.css';

const KPayCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    usePageTitle('KBZPay Manual Transfer');

    const searchParams = new URLSearchParams(location.search);
    const planType = searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly';

    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

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
            setError('Please upload a payment slip.');
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
                navigate('/kpay-success');
            } else {
                setError(response.data.error || 'Submission failed.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="settings-page min-h-screen bg-black text-white flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-2xl bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden mt-8">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#141414]">
                    <h1 className="text-2xl font-semibold text-white">KBZPay Manual Transfer</h1>
                    <button 
                        onClick={() => navigate('/upgrade')}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-8">
                        
                        <div className="text-center p-6 bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-2xl">
                                <p className="text-sm text-[#00d4aa] font-medium mb-2 uppercase tracking-wider">Total Amount Due</p>
                                <p className="text-5xl font-bold text-white">{amount}</p>
                                <p className="text-sm text-gray-400 mt-3">({planType === 'yearly' ? 'Yearly' : 'Monthly'} Pro Plan)</p>
                            </div>

                            <div className="space-y-6">
                                <p className="text-gray-300 text-lg leading-relaxed text-center">
                                    Please transfer the exact amount using KBZPay (KPay) to the account below, then upload the screenshot of the successful transaction.
                                </p>
                                
                                <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex gap-6 items-center justify-center">
                                    <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 flex-shrink-0">
                                        <QrCode size={48} className="text-gray-500" />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">KPay Account</p>
                                        <p className="text-2xl font-bold text-white">09123456789</p>
                                        <p className="text-md text-[#00d4aa]">MIN NOTE Admin</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-md font-medium text-gray-200">Upload Payment Slip</p>
                                <label 
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
                                        ${file ? 'border-[#00d4aa] bg-[#00d4aa]/5' : 'border-gray-700 hover:border-gray-500 bg-[#111] hover:bg-[#1a1a1a]'}
                                    `}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {file ? (
                                            <>
                                                <CheckCircle size={40} className="text-[#00d4aa] mb-3" />
                                                <p className="text-md text-gray-300 font-medium truncate max-w-xs">{file.name}</p>
                                                <p className="text-sm text-gray-500 mt-2">Click to replace file</p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud size={40} className="text-gray-400 mb-3" />
                                                <p className="text-md text-gray-300 mb-2"><span className="font-semibold text-[#00d4aa]">Click to upload</span> or drag and drop</p>
                                                <p className="text-sm text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>

                        </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-[#141414]">
                    <button 
                        onClick={handleSubmit}
                        disabled={!file || isSubmitting}
                        className={`w-full py-4 px-6 text-lg font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-200
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
                                Submitting...
                            </>
                        ) : (
                            'Submit Payment Proof'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default KPayCheckoutPage;
