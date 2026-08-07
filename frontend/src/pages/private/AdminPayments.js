import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import usePageTitle from '../../hooks/usePageTitle';
import '../../components/settings/Settings.css';

const AdminPayments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);

    usePageTitle('Admin | Manual Payments');

    useEffect(() => {
        if (user && !user.isAdmin) {
            toast.error('Not authorized as an admin');
            navigate('/notes');
        } else {
            fetchPayments();
        }
    }, [user, navigate]);

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/admin/manual-payments');
            if (response.data.success) {
                setPayments(response.data.payments);
            }
        } catch (error) {
            toast.error('Failed to fetch manual payments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const response = await axiosInstance.patch(`/admin/manual-payments/${id}/${action}`);
            if (response.data.success) {
                toast.success(`Payment ${action}d successfully`);
                fetchPayments();
            }
        } catch (error) {
            toast.error(`Failed to ${action} payment`);
        }
    };

    return (
        <div className="settings-page min-h-screen bg-black text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-6 mt-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manual KPay Payments</h1>
                        <p className="text-gray-400 mt-1">Verify and manage user subscription payments</p>
                    </div>
                    <button 
                        onClick={fetchPayments}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                        <i className="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                </div>

                {/* Table */}
                <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-[#1a1a1a] border-b border-gray-800 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Slip</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center mb-4">
                                                <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            Loading payments...
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            No manual payments found.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-white">{payment.userId?.email || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-500">{payment.userId?.name || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                                                    payment.planType === 'yearly' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {payment.planType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-200">
                                                {payment.amount.toLocaleString()} Ks
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <a 
                                                    href={payment.slipUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-[#00d4aa] hover:text-[#00b390] font-medium"
                                                >
                                                    <i className="bi bi-image"></i> View Slip
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                    payment.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                {payment.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleAction(payment._id, 'approve')}
                                                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors text-xs border border-green-500/20"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(payment._id, 'reject')}
                                                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-xs border border-red-500/20"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminPayments;
