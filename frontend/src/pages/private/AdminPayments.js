import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, X } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import usePageTitle from '../../hooks/usePageTitle';
import '../../components/settings/Settings.css';

export const getRejectReasonConfig = (type, t) => {
    const reasonKeys = {
        invalid_slip: { key: 'reason1', fallback: 'Invalid or Fake Receipt' },
        not_found: { key: 'reason2', fallback: 'Transaction Not Found' },
        incorrect_amount: { key: 'reason3', fallback: 'Incorrect Payment Amount' },
        duplicate: { key: 'reason4', fallback: 'Slip Already Used' },
        unclear_image: { key: 'reason5', fallback: 'Unclear or Blurry Image' },
        wrong_account: { key: 'reason6', fallback: 'Incorrect Bank/Account Number' },
        other: { key: 'other', fallback: 'Other' }
    };

    let config = {
        icon: 'bi-exclamation-triangle',
        colorClass: 'bg-red-500/10 text-red-400 border-red-500/20',
        label: reasonKeys[type] ? t(`admin.rejection.${reasonKeys[type].key}`, reasonKeys[type].fallback) : type
    };

    switch (type) {
        case 'invalid_slip':
            config.icon = 'bi-receipt-cutoff';
            config.colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
            break;
        case 'duplicate':
            config.icon = 'bi-files';
            config.colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
            break;
        case 'incorrect_amount':
            config.icon = 'bi-cash-coin';
            config.colorClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            break;
        case 'not_found':
            config.icon = 'bi-search';
            config.colorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            break;
        case 'wrong_account':
            config.icon = 'bi-bank';
            config.colorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            break;
        case 'unclear_image':
            config.icon = 'bi-image-alt';
            config.colorClass = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            break;
        case 'other':
            config.icon = 'bi-info-circle';
            config.colorClass = 'bg-gray-700/30 text-gray-300 border-gray-600';
            break;
        default:
            config.label = type || 'Unknown';
            break;
    }
    
    return config;
};

const RejectReasonBadge = ({ reason, t, iconOnly = false }) => {
    let type = reason;
    let customText = '';

    if (reason && reason.startsWith('custom:')) {
        type = 'other';
        customText = reason.substring(7).trim();
    }

    const config = getRejectReasonConfig(type, t);

    if (iconOnly) {
        return (
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${config.colorClass}`} title={config.label}>
                <i className={`bi ${config.icon} text-xs`}></i>
            </span>
        );
    }

    if (type === 'other') {
        return (
            <div className="relative group inline-flex">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.colorClass} cursor-help`}>
                    <i className={`bi ${config.icon}`}></i>
                    {t('admin.rejection.other', 'Other')}
                </span>
                {customText && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#222] text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[99] text-center border border-gray-700 pointer-events-none">
                        {customText}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#222]"></div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.colorClass}`}>
            <i className={`bi ${config.icon}`}></i>
            <span>{config.label}</span>
        </span>
    );
};

const CustomDropdown = ({ value, onChange, options, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);
    const selectedOption = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-[#00d4aa]/50 focus:border-[#00d4aa] p-3 outline-none transition-colors"
            >
                <div className="flex items-center gap-2">
                    {selectedOption.icon && <i className={`bi ${selectedOption.icon} ${selectedOption.iconColor}`}></i>}
                    <span>{selectedOption.label}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm transition-colors ${
                                value === option.value 
                                    ? 'bg-[#00d4aa]/10 text-[#00d4aa] font-medium' 
                                    : 'text-gray-300 hover:bg-[#222]'
                            }`}
                        >
                            {option.icon && <i className={`bi ${option.icon} ${value === option.value ? '' : option.iconColor}`}></i>}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminPayments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterUsageStatus, setFilterUsageStatus] = useState('all');
    const [filterRejectReason, setFilterRejectReason] = useState('all');
    const [sortDate, setSortDate] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [lightboxImage, setLightboxImage] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    
    // Rejection Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [customRemarks, setCustomRemarks] = useState('');

    const { user } = useSelector((state) => state.auth);
    const { t } = useTranslation();

    usePageTitle(t('admin.pageTitle'));

    const toggleRow = (id) => {
        setExpandedRow(prev => prev === id ? null : id);
    };

    const getReasonOptions = (options) => options.map(opt => {
        if (opt.value === 'all' || opt.value === '') return opt;
        const config = getRejectReasonConfig(opt.value, t);
        const textColor = config.colorClass.split(' ').find(c => c.startsWith('text-'));
        return { ...opt, icon: config.icon, iconColor: textColor };
    });

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/admin/manual-payments');
            if (response.data.success) {
                setPayments(response.data.payments);
            }
        } catch (error) {
            toast.error(t('admin.toast.fetchFail'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const handleRefresh = () => {
        setSearchQuery('');
        setFilterPlan('all');
        setFilterStatus('all');
        setFilterUsageStatus('all');
        setFilterRejectReason('all');
        setSortDate('newest');
        fetchPayments();
    };

    useEffect(() => {
        if (user && !user.isAdmin) {
            toast.error(t('admin.toast.notAuth'));
            navigate('/notes');
        } else {
            fetchPayments();
        }
    }, [user, navigate, fetchPayments, t]);

    useEffect(() => {
        if (lightboxImage || isRejectModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [lightboxImage, isRejectModalOpen]);

    const handleAction = async (id, action) => {
        try {
            const response = await axiosInstance.patch(`/admin/manual-payments/${id}/${action}`);
            if (response.data.success) {
                toast.success(t('admin.toast.actionSuccess').replace('{action}', action));
                fetchPayments();
            }
        } catch (error) {
            toast.error(t('admin.toast.actionFail').replace('{action}', action));
        }
    };

    const openRejectModal = (id) => {
        setSelectedPaymentId(id);
        setIsRejectModalOpen(true);
        setRejectionReason('');
        setCustomRemarks('');
    };

    const closeRejectModal = () => {
        setIsRejectModalOpen(false);
        setSelectedPaymentId(null);
        setRejectionReason('');
        setCustomRemarks('');
    };

    const submitRejection = async () => {
        if (!rejectionReason || (rejectionReason === 'other' && !customRemarks.trim())) {
            toast.error(t('admin.toast.selectReason', 'Please select a rejection reason'));
            return;
        }
        
        const finalReason = rejectionReason === 'other' 
            ? `custom: ${customRemarks}`
            : rejectionReason;
            
        try {
            const response = await axiosInstance.patch(`/admin/manual-payments/${selectedPaymentId}/reject`, {
                rejectionReason: finalReason
            });
            if (response.data.success) {
                toast.success(t('admin.toast.actionSuccess').replace('{action}', 'reject'));
                fetchPayments();
                closeRejectModal();
            }
        } catch (error) {
            toast.error(t('admin.toast.actionFail').replace('{action}', 'reject'));
        }
    };

    const getFulfillmentStatus = (payment) => {
        if (payment.status !== 'approved') return null;

        const user = payment.userId;
        if (!user) return null;

        const paymentDate = new Date(payment.createdAt || payment.updatedAt);
        let expirationDate = new Date(paymentDate);
        if (payment.planType === 'yearly') {
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        } else {
            expirationDate.setMonth(expirationDate.getMonth() + 1);
        }
        
        const isChronologicallyExpired = new Date() > expirationDate;

        if (isChronologicallyExpired) {
            return { key: 'expired', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
        }

        if (user.plan === 'free') {
            return { key: 'revoked', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        }

        if (user.plan === 'pro') {
            if (user.cancelAtPeriodEnd) {
                return { key: 'canceling', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
            }
            return { key: 'active', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
        }
        
        return null;
    };

    const filteredPayments = payments
        .filter(p => filterStatus === 'all' ? true : p.status === filterStatus)
        .filter(p => filterPlan === 'all' ? true : p.planType === filterPlan)
        .filter(p => {
            if (filterUsageStatus === 'all') return true;
            const usageStatus = getFulfillmentStatus(p);
            if (filterUsageStatus === 'na') return !usageStatus;
            return usageStatus && usageStatus.key === filterUsageStatus;
        })
        .filter(p => {
            if (filterStatus !== 'rejected' || filterRejectReason === 'all') return true;
            if (filterRejectReason === 'other') {
                return p.rejectionReason === 'other' || (p.rejectionReason && p.rejectionReason.startsWith('custom:'));
            }
            return p.rejectionReason === filterRejectReason;
        })
        .filter(p => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            const email = p.userId?.email?.toLowerCase() || '';
            const name = p.userId?.name?.toLowerCase() || '';
            return email.includes(query) || name.includes(query);
        })
        .sort((a, b) => {
            if (sortDate === 'az' || sortDate === 'za') {
                const nameA = a.userId?.email?.toLowerCase() || '';
                const nameB = b.userId?.email?.toLowerCase() || '';
                if (sortDate === 'az') return nameA.localeCompare(nameB);
                return nameB.localeCompare(nameA);
            } else {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortDate === 'newest' ? dateB - dateA : dateA - dateB;
            }
        });

    return (
        <div className="settings-page w-full min-h-screen bg-black text-white p-2 sm:p-4 md:p-8">
            <div className="w-full max-w-7xl mx-auto space-y-6 mt-6">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2 w-fit text-sm font-medium"
                >
                    <i className="bi bi-arrow-left"></i> {t('admin.backBtn', 'Back to Settings')}
                </button>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{t('admin.title')}</h1>
                        <p className="text-gray-400 mt-1">{t('admin.desc')}</p>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                        <i className="bi bi-arrow-clockwise"></i> {t('admin.refresh')}
                    </button>
                </div>

                {/* Search & Controls Header */}
                <div className="bg-gray-800/20 border border-gray-800/50 rounded-2xl p-4 mb-6 shadow-sm flex flex-col gap-4 w-full">
                    {/* Search Bar */}
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('admin.filters.searchPlaceholder', 'Search by name or email...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-[#00d4aa]/50 focus:border-[#00d4aa] block py-3 pr-3 pl-11 outline-none transition-colors placeholder-gray-500"
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-between w-full flex-wrap">
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-wrap">
                            <CustomDropdown
                                value={filterPlan}
                                onChange={setFilterPlan}
                                className="min-w-[140px] w-full sm:w-auto z-40"
                                options={[
                                    { value: 'all', label: t('admin.filters.allPlans', 'All Plans') },
                                    { value: 'monthly', label: t('admin.filters.monthly', 'Monthly') },
                                    { value: 'yearly', label: t('admin.filters.yearly', 'Yearly') }
                                ]}
                            />
                            <CustomDropdown
                                value={filterStatus}
                                onChange={setFilterStatus}
                                className="min-w-[140px] w-full sm:w-auto z-30"
                                options={[
                                    { value: 'all', label: t('admin.filters.all', 'All Statuses') },
                                    { value: 'pending', label: t('admin.status.pending', 'Pending') },
                                    { value: 'approved', label: t('admin.status.approved', 'Approved') },
                                    { value: 'rejected', label: t('admin.status.rejected', 'Rejected') }
                                ]}
                            />
                            <CustomDropdown
                                value={filterUsageStatus}
                                onChange={setFilterUsageStatus}
                                className="min-w-[150px] w-full sm:w-auto z-20"
                                options={[
                                    { value: 'all', label: t('admin.usageStatus.all', 'All Usage') },
                                    { value: 'active', label: t('admin.usageStatus.active', 'Active') },
                                    { value: 'canceling', label: t('admin.usageStatus.canceling', 'Canceling') },
                                    { value: 'revoked', label: t('admin.usageStatus.revoked', 'Revoked') },
                                    { value: 'expired', label: t('admin.usageStatus.expired', 'Expired') },
                                    { value: 'na', label: t('admin.usageStatus.na', '-') }
                                ]}
                            />
                            {filterStatus === 'rejected' && (
                                <CustomDropdown
                                    value={filterRejectReason}
                                    onChange={setFilterRejectReason}
                                    className="min-w-[180px] w-full sm:w-auto z-10"
                                    options={getReasonOptions([
                                        { value: 'all', label: t('admin.rejection.all', 'All Reasons') },
                                        { value: 'invalid_slip', label: t('admin.rejection.reason1', 'Invalid or Fake Receipt') },
                                        { value: 'not_found', label: t('admin.rejection.reason2', 'Transaction Not Found') },
                                        { value: 'incorrect_amount', label: t('admin.rejection.reason3', 'Incorrect Payment Amount') },
                                        { value: 'duplicate', label: t('admin.rejection.reason4', 'Slip Already Used') },
                                        { value: 'unclear_image', label: t('admin.rejection.reason5', 'Unclear or Blurry Image') },
                                        { value: 'wrong_account', label: t('admin.rejection.reason6', 'Incorrect Bank/Account Number') },
                                        { value: 'other', label: t('admin.rejection.other', 'Other / Remarks') }
                                    ])}
                                />
                            )}
                        </div>
                        <div className="w-full md:w-auto">
                            <CustomDropdown
                                value={sortDate}
                                onChange={setSortDate}
                                className="min-w-[160px] w-full sm:w-auto"
                                options={[
                                    { value: 'newest', label: t('admin.filters.newest', 'Newest First') },
                                    { value: 'oldest', label: t('admin.filters.oldest', 'Oldest First') },
                                    { value: 'az', label: t('admin.filters.aToZ', 'A to Z') },
                                    { value: 'za', label: t('admin.filters.zToA', 'Z to A') }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#111]/50 border border-gray-800/50 rounded-2xl shadow-sm w-full overflow-hidden">
                    <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-900/50 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <table className="block md:table w-full md:min-w-[1100px] text-left text-sm text-gray-300">
                            <thead className="hidden md:table-header-group bg-[#1a1a1a] border-b border-gray-800 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 first:pl-8 last:pr-8 py-4 whitespace-nowrap text-left">{t('admin.table.user')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">{t('admin.table.plan')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">{t('admin.table.amount')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">{t('admin.table.date')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">{t('admin.table.slip')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">{t('admin.table.status')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">{t('admin.table.usageStatus', 'Usage Status')}</th>
                                    <th className="px-6 first:pl-8 last:pr-8 py-4 whitespace-nowrap text-center">{t('admin.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="block md:table-row-group divide-y divide-gray-800 md:divide-y-0 space-y-4 md:space-y-0 p-2 sm:p-4 md:p-0">
                                {isLoading ? (
                                    <tr className="block md:table-row">
                                        <td colSpan="8" className="block md:table-cell px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center mb-4">
                                                <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            {t('admin.table.loading')}
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr className="block md:table-row">
                                        <td colSpan="8" className="block md:table-cell px-6 py-12 text-center text-gray-500">
                                            {t('admin.table.noPayments')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <React.Fragment key={payment._id}>
                                        <tr 
                                            onClick={() => toggleRow(payment._id)}
                                            className={`block md:table-row rounded-lg mb-4 md:mb-0 p-3 sm:p-4 md:p-0 border transition-colors cursor-pointer group ${
                                                expandedRow === payment._id 
                                                ? 'bg-[#1a1a1a]/80 md:bg-[#1a1a1a]/80 border-gray-600' 
                                                : 'bg-gray-800/40 md:bg-transparent border-gray-700 md:border-b md:hover:bg-[#1a1a1a]/50'
                                            }`}
                                        >
                                            <td className="flex justify-between items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap md:border-none w-auto md:text-left gap-2">
                                                <div className="flex items-center gap-3">
                                                    <ChevronDown size={16} className={`hidden md:block text-gray-500 transition-transform duration-200 ${expandedRow === payment._id ? 'rotate-180 text-[#00d4aa]' : 'group-hover:text-gray-300'}`} />
                                                    <span className="w-24 shrink-0 text-gray-400 text-sm font-medium md:hidden">{t('admin.table.user')}:</span>
                                                    <div className="flex-1 text-right md:text-left">
                                                        <div className="font-medium text-white">{payment.userId?.email || t('admin.table.unknownUser')}</div>
                                                        <div className="text-xs text-gray-500">{payment.userId?.name || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="flex justify-between items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap md:border-none md:text-center gap-2">
                                                <span className="w-24 shrink-0 text-gray-400 text-sm font-medium md:hidden">{t('admin.table.plan')}:</span>
                                                <div className="flex-1 min-w-0 text-right md:text-center truncate">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                                                        payment.planType === 'yearly' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                        {payment.planType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="flex justify-between items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap font-medium text-gray-200 md:border-none md:text-center gap-2">
                                                <span className="w-24 shrink-0 text-gray-400 text-sm font-medium md:hidden">{t('admin.table.amount')}:</span>
                                                <div className="flex-1 min-w-0 text-right md:text-center truncate">
                                                    {payment.amount.toLocaleString()} Ks
                                                </div>
                                            </td>
                                            <td className="flex justify-between items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap text-gray-400 md:border-none md:text-center gap-2">
                                                <span className="w-24 shrink-0 text-gray-400 text-sm font-medium md:hidden">{t('admin.table.date')}:</span>
                                                <div className="flex-1 min-w-0 text-right md:text-center truncate">
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="flex justify-between items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap md:border-none md:text-center gap-2">
                                                <span className="w-24 shrink-0 text-gray-400 text-sm font-medium md:hidden">{t('admin.table.slip')}:</span>
                                                <div className="flex-1 min-w-0 text-right md:text-center truncate">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setLightboxImage(payment.slipUrl); }}
                                                        className="inline-flex items-center gap-1.5 text-[#00d4aa] hover:text-[#00b390] font-medium transition-colors"
                                                    >
                                                        <i className="bi bi-image"></i> {t('admin.table.viewSlip')}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="flex justify-between md:flex-col items-center md:items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap md:border-none md:text-center gap-2">
                                                <span className="w-24 shrink-0 text-gray-400 text-sm font-medium md:hidden">{t('admin.table.status')}:</span>
                                                <div className="flex-1 min-w-0 text-right md:text-center flex flex-row md:flex-col items-center justify-end md:justify-center gap-1.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                        payment.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                        {t(`admin.status.${payment.status}`)}
                                                    </span>
                                                    {payment.status === 'rejected' && payment.rejectionReason && (
                                                        <RejectReasonBadge reason={payment.rejectionReason} t={t} iconOnly={true} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="flex justify-between items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap md:border-none md:text-center gap-2">
                                                <span className="w-24 shrink-0 text-gray-400 text-sm font-medium md:hidden">{t('admin.table.usageStatus', 'Usage Status')}:</span>
                                                <div className="flex-1 min-w-0 text-right md:text-center truncate">
                                                    {getFulfillmentStatus(payment) ? (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getFulfillmentStatus(payment).color}`}>
                                                            {t(`admin.usageStatus.${getFulfillmentStatus(payment).key}`)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="flex justify-between md:justify-center items-center md:table-cell md:px-6 md:first:pl-8 md:last:pr-8 py-2 md:py-4 whitespace-nowrap md:text-center font-medium">
                                                {payment.status === 'pending' && (
                                                    <div className="flex justify-end md:justify-center items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleAction(payment._id, 'approve'); }}
                                                            className="px-4 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors text-xs border border-green-500/20 text-center"
                                                        >
                                                            {t('admin.table.approve')}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openRejectModal(payment._id); }}
                                                            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-xs border border-red-500/20 text-center"
                                                        >
                                                            {t('admin.table.reject')}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {expandedRow === payment._id && (
                                            <tr className="block md:table-row bg-[#151515] md:bg-[#151515] border-x border-b border-gray-700/50">
                                                <td colSpan="8" className="block md:table-cell p-4 md:p-6 text-sm relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00d4aa]"></div>
                                                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-gray-300">
                                                        {payment.status === 'rejected' && payment.rejectionReason && (
                                                            <div className="flex-1 bg-red-500/5 rounded-xl border border-red-500/10 p-4">
                                                                <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                                                                    <i className="bi bi-x-circle"></i> {t('admin.table.rejectionDetails', 'Rejection Details')}
                                                                </h4>
                                                                <div className="flex flex-col items-start gap-3">
                                                                    <RejectReasonBadge reason={payment.rejectionReason} t={t} />
                                                                    {payment.rejectionReason.startsWith('custom:') && (
                                                                        <div className="w-full bg-[#1a1a1a]/80 p-3 rounded-r-lg border-l-4 border-red-500/50 text-gray-300 text-sm mt-1">
                                                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">
                                                                                <i className="bi bi-pencil-square"></i> {t('admin.table.adminNote', "Admin's Note")}
                                                                            </div>
                                                                            <div className="leading-relaxed whitespace-pre-wrap">
                                                                                {payment.rejectionReason.substring(7).trim()}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 space-y-3">
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                <div className="text-gray-500">{t('admin.table.plan')}:</div>
                                                                <div className="text-left text-gray-200 capitalize">{payment.planType}</div>
                                                                
                                                                <div className="text-gray-500">{t('admin.table.amount')}:</div>
                                                                <div className="text-left text-[#00d4aa] font-medium">{payment.amount.toLocaleString()} Ks</div>
                                                                
                                                                <div className="text-gray-500">{t('admin.table.date')}:</div>
                                                                <div className="text-left text-gray-200">{new Date(payment.createdAt).toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                        {payment.status === 'pending' && (
                                                            <div className="flex-1 flex flex-col justify-center gap-3">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleAction(payment._id, 'approve'); }}
                                                                    className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors font-medium border border-green-500/20 flex items-center justify-center gap-2"
                                                                >
                                                                    <i className="bi bi-check-lg"></i> {t('admin.table.approve')}
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); openRejectModal(payment._id); }}
                                                                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors font-medium border border-red-500/20 flex items-center justify-center gap-2"
                                                                >
                                                                    <i className="bi bi-x-lg"></i> {t('admin.table.reject')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile/Tablet Swipe Hint */}
                <div className="hidden md:block lg:hidden text-xs text-gray-400 mt-3 text-center">
                    {t('admin.swipeHint')}
                </div>

                {/* Rejection Modal */}
                {isRejectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                            <h3 className="text-xl font-bold text-white mb-4">{t('admin.rejection.title', 'Reject Payment')}</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('admin.rejection.selectReason', 'Select Reason')}</label>
                                    <CustomDropdown
                                        value={rejectionReason}
                                        onChange={setRejectionReason}
                                        className="w-full z-10"
                                        options={getReasonOptions([
                                            { value: '', label: t('admin.rejection.selectReason', 'Select Reason') },
                                            { value: 'invalid_slip', label: t('admin.rejection.reason1', 'Invalid or Fake Receipt') },
                                            { value: 'not_found', label: t('admin.rejection.reason2', 'Transaction Not Found') },
                                            { value: 'incorrect_amount', label: t('admin.rejection.reason3', 'Incorrect Payment Amount') },
                                            { value: 'duplicate', label: t('admin.rejection.reason4', 'Slip Already Used') },
                                            { value: 'unclear_image', label: t('admin.rejection.reason5', 'Unclear or Blurry Image') },
                                            { value: 'wrong_account', label: t('admin.rejection.reason6', 'Incorrect Bank/Account Number') },
                                            { value: 'other', label: t('admin.rejection.other', 'Other / Remarks') }
                                        ])}
                                    />
                                </div>

                                {rejectionReason === 'other' && (
                                    <div>
                                        <textarea 
                                            value={customRemarks}
                                            onChange={(e) => setCustomRemarks(e.target.value)}
                                            placeholder={t('admin.rejection.customPlaceholder', 'Enter custom rejection reason...')}
                                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-lg focus:ring-[#00d4aa] focus:border-[#00d4aa] p-3 min-h-[100px] outline-none resize-none"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={closeRejectModal}
                                        className="flex-1 px-4 py-2 bg-[#1a1a1a] hover:bg-gray-800 text-gray-300 rounded-lg transition-colors font-medium border border-gray-700"
                                    >
                                        {t('admin.rejection.cancel', 'Cancel')}
                                    </button>
                                    <button 
                                        onClick={submitRejection}
                                        className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors font-medium border border-red-500/20"
                                    >
                                        {t('admin.rejection.confirm', 'Confirm Rejection')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lightbox Modal */}
                {lightboxImage && (
                    <div 
                        className="fixed inset-0 z-[9999] w-screen h-[100dvh] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
                        onClick={() => setLightboxImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center cursor-default" onClick={e => e.stopPropagation()}>
                            <button 
                                onClick={() => setLightboxImage(null)}
                                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                            <img 
                                src={lightboxImage} 
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

export default AdminPayments;
