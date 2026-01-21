import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
    LayoutDashboard,
    Receipt,
    FileText,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    Calendar,
    Settings,
    DollarSign,
    Trash2,
    Mail,
    ChevronRight,
    Download,
    Eye,
    ArrowUpRight,
    ExternalLink,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useNotification } from '../../hooks/useNotification';

const AdminPayments = () => {
    const { toast, alert } = useNotification();
    // UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Data State
    const [summary, setSummary] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [feeStructures, setFeeStructures] = useState([]);
    const [overdueList, setOverdueList] = useState([]);
    const [classes, setClasses] = useState([]);

    // Class-Wise Payment State
    const [selectedClassId, setSelectedClassId] = useState('');
    const [classStudents, setClassStudents] = useState([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    // Modal State
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    const [invoiceForm, setInvoiceForm] = useState({
        student_id: '',
        title: '',
        total_amount: '',
        due_date: ''
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        method: 'Cash',
        description: ''
    });

    const [feeForm, setFeeForm] = useState({
        name: '',
        amount: '',
        class_id: '',
        frequency: 'monthly',
        description: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchSummary(),
                    fetchClasses()
                ]);
            } catch (error) {
                console.error('Error loading initial payment data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        // Fetch tab-specific data when tab changes
        if (activeTab === 'invoices' && invoices.length === 0) fetchInvoices();
        if (activeTab === 'templates' && feeStructures.length === 0) fetchFeeStructures();
        if (activeTab === 'overdue' && overdueList.length === 0) fetchOverdue();
    }, [activeTab]);

    const fetchSummary = async () => {
        try {
            const response = await api.get('/admin/accounting/summary');
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/admin/accounting/invoices');
            setInvoices(response.data.data || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const fetchFeeStructures = async () => {
        try {
            const response = await api.get('/admin/accounting/fee-structures');
            setFeeStructures(response.data);
        } catch (error) {
            console.error('Error fetching fee structures:', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchOverdue = async () => {
        try {
            const response = await api.get('/admin/accounting/overdue');
            setOverdueList(response.data.data || []); // Adjusted for paginated response
        } catch (error) {
            console.error('Error fetching overdue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSearch = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await api.get(`/admin/students?search=${query}`);
            setSearchResults(response.data.data || []);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const fetchClassPayments = async (classId) => {
        if (!classId) return;
        setIsClassLoading(true);
        try {
            const response = await api.get(`/admin/class-payments?class_id=${classId}`);
            setClassStudents(response.data || []);
        } catch (error) {
            toast.error('Failed to load class payments');
        } finally {
            setIsClassLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClassId) {
            fetchClassPayments(selectedClassId);
        }
    }, [selectedClassId]);

    const createInvoice = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Generating invoice...');
        try {
            await api.post('/admin/accounting/invoices', invoiceForm);
            setIsInvoiceModalOpen(false);
            fetchInvoices();
            setInvoiceForm({ student_id: '', title: '', total_amount: '', due_date: '' });
            toast.success('Invoice created successfully');
            toast.dismiss(loadToast);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create invoice');
            toast.dismiss(loadToast);
        }
    };

    const recordPayment = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Recording payment...');
        try {
            let response;
            // Use the new endpoint for robust partial payment support
            response = await api.post('/admin/class-payments/pay', {
                invoice_id: selectedInvoice.id,
                amount: paymentForm.amount,
                payment_date: paymentForm.payment_date,
                payment_method: paymentForm.method, // Mapping 'method' to 'payment_method'
                remarks: paymentForm.description
            });

            setIsPaymentModalOpen(false);
            fetchSummary(); // Refresh stats
            if (activeTab === 'invoices') fetchInvoices();
            if (activeTab === 'overdue') fetchOverdue();
            if (selectedClassId) fetchClassPayments(selectedClassId); // Refresh class view if active

            toast.success('Payment recorded successfully');
            toast.dismiss(loadToast);

            // If the backend returns a receipt URL or we want to construct one
            if (response.data.receipt_url) {
                window.open(response.data.receipt_url, '_blank');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to record payment');
            toast.dismiss(loadToast);
        }
    };

    const createFeeStructure = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Saving fee structure...');
        try {
            await api.post('/admin/accounting/fee-structures', feeForm);
            setIsFeeModalOpen(false);
            fetchFeeStructures();
            toast.success('Fee structure saved');
            toast.dismiss(loadToast);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save fee structure');
            toast.dismiss(loadToast);
        }
    };

    const deleteFeeStructure = async (id) => {
        const result = await alert.confirmDelete('Delete Fee Structure?', 'Are you sure you want to delete this fee structure?');
        if (result.isConfirmed) {
            const loadToast = toast.loading('Deleting...');
            try {
                await api.delete(`/admin/accounting/fee-structures/${id}`);
                fetchFeeStructures();
                toast.success('Deleted successfully');
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to delete');
                toast.dismiss(loadToast);
            }
        }
    };

    const sendReminder = async (invoiceId) => {
        const loadToast = toast.loading('Sending reminder...');
        try {
            await api.post(`/admin/accounting/invoices/${invoiceId}/remind`);
            toast.success('Reminder sent successfully');
            toast.dismiss(loadToast);
        } catch (error) {
            toast.error('Failed to send reminder');
            toast.dismiss(loadToast);
        }
    };

    const downloadReceipt = async (paymentId) => {
        const loadToast = toast.loading('Preparing receipt...');
        try {
            const response = await api.get(`/admin/accounting/payments/${paymentId}/receipt`, {
                responseType: 'blob'
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Download started');
            toast.dismiss(loadToast);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download receipt');
            toast.dismiss(loadToast);
        }
    };

    const deleteInvoice = async (id) => {
        const result = await alert.confirmDelete('Delete Invoice?', 'Are you sure you want to delete this invoice? This action cannot be undone.');
        if (result.isConfirmed) {
            const loadToast = toast.loading('Deleting invoice...');
            try {
                await api.delete(`/admin/accounting/invoices/${id}`);
                if (activeTab === 'invoices') fetchInvoices();
                if (activeTab === 'overdue') fetchOverdue();
                toast.success('Invoice deleted successfully');
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to delete invoice');
                toast.dismiss(loadToast);
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
            partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
            pending: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-200 dark:border-slate-800',
            overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    const chartData = (summary?.monthly_revenue || []).map(item => ({
        month: item.month,
        revenue: parseFloat(item.total || 0)
    }));

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Payments & Finance</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage school fees, invoices, and billing structures</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsFeeModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <Settings size={18} />
                        Fee Structures
                    </button>
                    <button
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                {[
                    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                    { id: 'class_payments', label: 'Class Payments', icon: Users },
                    { id: 'invoices', label: 'All Invoices', icon: Receipt },
                    { id: 'templates', label: 'Fee Structures', icon: FileText },
                    { id: 'overdue', label: 'Overdue Payments', icon: AlertCircle }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Collected</p>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                            ${summary?.stats?.total_revenue?.toLocaleString() || '0.00'}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                            ${summary?.stats?.total_outstanding?.toLocaleString() || '0.00'}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overdue Invoices</p>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                            {summary?.stats?.overdue_invoices || '0'}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Chart */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Overview</h4>
                                <p className="text-sm text-slate-500">Monthly collection trends</p>
                            </div>
                            <div className="h-[320px] w-full">
                                {loading || !chartData.length ? (
                                    <div className="h-full w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                                        Preparing analytics...
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                                                tickFormatter={(v) => `$${v}`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                                                {chartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#2563eb' : '#94a3b8'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'class_payments' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Class Selector */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Class-Wise Payment Management</h3>
                            <div className="max-w-md">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Select Class</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                >
                                    <option value="">-- Choose a Class --</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Students List */}
                        {selectedClassId && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                {isClassLoading ? (
                                    <div className="p-12 text-center text-slate-400">Loading class data...</div>
                                ) : classStudents.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">No students found in this class.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {classStudents.map(student => (
                                            <div key={student.id} className="p-6">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white">{student.name}</h4>
                                                        <p className="text-xs text-slate-500 font-mono">{student.admission_number}</p>
                                                    </div>
                                                </div>

                                                {/* Student Invoices */}
                                                <div className="pl-14">
                                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Outstanding Invoices</h5>
                                                    {student.invoices && student.invoices.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {student.invoices.map(invoice => (
                                                                <div key={invoice.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-500">
                                                                            <Receipt size={16} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{invoice.title}</p>
                                                                            <p className="text-[10px] text-slate-400 font-mono">Due: {invoice.due_date}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-6">
                                                                        <div className="text-right">
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Balance</p>
                                                                            <p className="text-sm font-black text-slate-800 dark:text-white">${parseFloat(invoice.due_amount).toLocaleString()}</p>
                                                                        </div>
                                                                        <div className="text-right hidden md:block">
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Paid</p>
                                                                            <p className="text-sm font-bold text-green-600">${parseFloat(invoice.paid_amount).toLocaleString()}</p>
                                                                        </div>
                                                                        <div>
                                                                            {getStatusBadge(invoice.status)}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => sendReminder(invoice.id)}
                                                                                className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                                                                title="Send Reminder"
                                                                            >
                                                                                <Mail size={16} />
                                                                            </button>

                                                                            {invoice.payments && invoice.payments.length > 0 && (
                                                                                <button
                                                                                    onClick={() => downloadReceipt(invoice.payments[0].id)}
                                                                                    className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                                                    title="Download Receipt"
                                                                                >
                                                                                    <Download size={16} />
                                                                                </button>
                                                                            )}

                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedInvoice({ ...invoice, student: { user: { name: student.name } } });
                                                                                    setIsPaymentModalOpen(true);
                                                                                    setPaymentForm(prev => ({ ...prev, amount: invoice.due_amount }));
                                                                                }}
                                                                                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                                                                            >
                                                                                Pay Now
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic">No pending invoices for this student.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'invoices' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by student or invoice #..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold px-4 outline-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Student & Invoice</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Paid</th>
                                        <th className="px-6 py-4">Balance</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                                        {inv.student?.user?.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                                                            {inv.student?.user?.name}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{inv.invoice_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                ${parseFloat(inv.total_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                                                ${parseFloat(inv.paid_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-red-500">
                                                ${parseFloat(inv.due_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {new Date(inv.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(inv.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {inv.status !== 'paid' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInvoice(inv);
                                                                setIsPaymentModalOpen(true);
                                                                setPaymentForm(prev => ({ ...prev, amount: inv.due_amount }));
                                                            }}
                                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                            title="Add Payment"
                                                        >
                                                            <DollarSign size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => sendReminder(inv.id)}
                                                        className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                                                        title="Send Reminder"
                                                    >
                                                        <Mail size={18} />
                                                    </button>
                                                    {inv.payments && inv.payments.length > 0 && (
                                                        <button
                                                            onClick={() => downloadReceipt(inv.payments[0].id)}
                                                            className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                                                            title="Receipt"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteInvoice(inv.id)}
                                                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                                        title="Delete Invoice"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {feeStructures.map(str => (
                            <div key={str.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <FileText size={20} className="text-blue-500" />
                                    </div>
                                    <button
                                        onClick={() => deleteFeeStructure(str.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">{str.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{str.frequency}</span>
                                    <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{str.class?.name || 'All Classes'}</span>
                                </div>
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-800 dark:text-white">${parseFloat(str.amount).toLocaleString()}</span>
                                    <span className="text-xs font-bold text-slate-400">/ {str.frequency}</span>
                                </div>
                                <button className="w-full mt-6 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all">
                                    Edit Details
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => setIsFeeModalOpen(true)}
                            className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 hover:border-blue-400 hover:bg-white transition-all group min-h-[220px]"
                        >
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-slate-300 group-hover:text-blue-500 shadow-sm">
                                <Plus size={32} />
                            </div>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Add New Fee Type</span>
                        </button>
                    </div>
                )}

                {activeTab === 'overdue' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500 text-white rounded-xl shadow-md">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-800 dark:text-red-400">Collection Attention Required</h4>
                                    <p className="text-sm text-red-600 dark:text-red-500">The following students have unpaid invoices past the deadline.</p>
                                </div>
                            </div>
                            <button className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-red-700 transition-shadow shadow-lg shadow-red-500/20">
                                Send Bulk Reminders
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {overdueList.map(item => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center font-bold text-slate-400">
                                            {item.student?.user?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{item.student?.user?.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 uppercase">{item.invoice_number}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-red-500 uppercase">Overdue</p>
                                            <p className="text-xs font-bold text-slate-500">
                                                {item.due_date ? Math.max(0, Math.ceil((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24))) : 0} Days
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-xs font-bold text-slate-400">Remaining Balance:</p>
                                        <p className="text-xl font-black text-red-500">${parseFloat(item.due_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedInvoice(item);
                                                setIsPaymentModalOpen(true);
                                                setPaymentForm(prev => ({ ...prev, amount: item.due_amount }));
                                            }}
                                            className="flex-1 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all"
                                        >
                                            Collect
                                        </button>
                                        <button
                                            onClick={() => sendReminder(item.id)}
                                            className="p-2 bg-slate-100 text-slate-500 hover:text-blue-600 rounded-xl transition-all"
                                        >
                                            <Mail size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                title="Create New Invoice"
                size="md"
            >
                <form onSubmit={createInvoice} className="space-y-5 py-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Student</label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or student code..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                onChange={(e) => handleStudentSearch(e.target.value)}
                            />
                            {invoiceForm.student_id && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle size={18} className="text-green-500" />
                                </div>
                            )}
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-48 overflow-y-auto">
                                {searchResults.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                            setInvoiceForm({ ...invoiceForm, student_id: s.id });
                                            setSearchResults([]);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between items-center transition-colors"
                                    >
                                        <span className="font-bold text-sm">{s.user?.name}</span>
                                        <span className="text-[10px] font-mono text-slate-400">#{s.student_code}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Invoice Label</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Tuition Fee - Q1"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            value={invoiceForm.title}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                value={invoiceForm.total_amount}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, total_amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                value={invoiceForm.due_date}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsInvoiceModalOpen(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            Generate Invoice
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Record Payment"
                size="sm"
            >
                <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Paying For</p>
                    <h5 className="font-bold text-slate-800 dark:text-white leading-tight">{selectedInvoice?.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedInvoice?.student?.user?.name}</p>
                    <div className="mt-4 pt-4 border-t border-blue-100/50 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-500">Total Balance:</span>
                        <span className="text-2xl font-black text-blue-600">${selectedInvoice?.due_amount}</span>
                    </div>
                </div>

                <form onSubmit={recordPayment} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Amount ($)</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-blue-600"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            max={selectedInvoice?.due_amount}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                        <select
                            required
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                            value={paymentForm.method}
                            onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Credit/Debit Card</option>
                            <option value="Mobile Money">Mobile Wallet</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="flex-1 py-3 text-slate-400 font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            Post Payment
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
                title="Manage Fee Templates"
                size="md"
            >
                <form onSubmit={createFeeStructure} className="space-y-5 py-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fee Category Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Laboratory Fee"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            value={feeForm.name}
                            onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                value={feeForm.amount}
                                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Interval</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                value={feeForm.frequency}
                                onChange={(e) => setFeeForm({ ...feeForm, frequency: e.target.value })}
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one_time">One-Time</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Target Group</label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            value={feeForm.class_id}
                            onChange={(e) => setFeeForm({ ...feeForm, class_id: e.target.value })}
                        >
                            <option value="">All Students (Global)</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsFeeModalOpen(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            Save Template
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminPayments;
