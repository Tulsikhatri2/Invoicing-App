import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    InputAdornment,
    TablePagination,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import { FaColumns, FaEdit, FaFileExport, FaPlus, FaPrint, FaSearch, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getInvoiceListData, getInvoiceMetricsData, getTopItemsData, getTrend12mData, deleteInvoiceAction } from '../Redux/slices/data/dataSlice';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const Invoices = () => {
    const [timeFilter, setTimeFilter] = useState('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { invoiceListData, invoiceMetrics, topItems, trend12m } = useSelector(state => state.data);

    const filteredInvoices = React.useMemo(() => {
        if (!invoiceListData) return [];
        if (!searchQuery) return invoiceListData;
        return invoiceListData.filter(row =>
            String(row.invoiceNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(row.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [invoiceListData, searchQuery]);

    const computedCount = Array.isArray(invoiceListData) ? invoiceListData.length : 0;
    const computedTotal = Array.isArray(invoiceListData)
        ? invoiceListData.reduce((sum, row) => sum + Number(row.invoiceAmount || row.total || row.Total || 0), 0)
        : 0;

    const fetchFilteredData = (filter) => {
        const now = new Date();
        let fromDate, toDate;
        toDate = now.toISOString().split('T')[0];

        if (filter === 'today') {
            fromDate = toDate;
        } else if (filter === 'week') {
            const past = new Date(now);
            past.setDate(past.getDate() - 7);
            fromDate = past.toISOString().split('T')[0];
        } else if (filter === 'month') {
            const past = new Date(now);
            past.setMonth(past.getMonth() - 1);
            fromDate = past.toISOString().split('T')[0];
        } else if (filter === 'year') {
            const past = new Date(now);
            past.setFullYear(past.getFullYear() - 1);
            fromDate = past.toISOString().split('T')[0];
        } else {
            const past = new Date(now);
            past.setMonth(past.getMonth() - 1);
            fromDate = past.toISOString().split('T')[0];
        }

        dispatch(getInvoiceListData(filter));
        dispatch(getInvoiceMetricsData({ fromDate, toDate }));
        dispatch(getTopItemsData(5));
    };

    const handleTimeFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setTimeFilter(newFilter);
            fetchFilteredData(newFilter);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            dispatch(deleteInvoiceAction(id)).then(() => {
                fetchFilteredData(timeFilter);
            });
        }
    };

    const handlePrint = (invoiceId) => {
        window.print();
    };

    const handleExport = () => {
        if (!filteredInvoices || filteredInvoices.length === 0) return;
        const exportData = filteredInvoices.map(row => ({
            'Invoice No': row.invoiceNo || row.InvoiceNo,
            'Date': row.date || row.Date,
            'Customer': row.customer || row.Customer,
            'Items': row.items || row.Items,
            'Sub Total': row.subTotal || row.SubTotal,
            'Tax %': row.taxPct || row.TaxPct,
            'Tax Amt': row.taxAmt || row.TaxAmt,
            'Total': row.total || row.Total
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Invoices");
        XLSX.writeFile(wb, "Invoices_Export.xlsx");
    };

    useEffect(() => {
        fetchFilteredData(timeFilter);
        dispatch(getTrend12mData(new Date().toISOString()));
    }, []);
    return (
        <Box sx={{ p: 4, backgroundColor: '#f9fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                    Invoices
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <ToggleButtonGroup
                        value={timeFilter}
                        exclusive
                        onChange={handleTimeFilterChange}
                        size="small"
                        sx={{ backgroundColor: '#fff', borderRadius: '24px', '& .MuiToggleButton-root': { border: 'none', px: 2, py: 0.5, borderRadius: '24px', textTransform: 'none', color: '#666' }, '& .Mui-selected': { backgroundColor: '#1a1a1a !important', color: '#fff !important' } }}
                    >
                        <ToggleButton value="today">Today</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                        <ToggleButton value="year">Year</ToggleButton>
                        <ToggleButton value="custom">Custom</ToggleButton>
                    </ToggleButtonGroup>
                    <LogoutButton />
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid #eee' }}>
                        <CardContent>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                                {computedCount.toLocaleString(undefined)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#777', fontWeight: 500 }}>
                                Number of Invoices
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#aaa', textTransform: 'capitalize' }}>
                                {timeFilter}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid #eee' }}>
                        <CardContent>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                                ${computedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#777', fontWeight: 500 }}>
                                Total Invoice Amount
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#aaa', textTransform: 'capitalize' }}>
                                {timeFilter}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" sx={{ color: '#aaa', mb: 2, display: 'block' }}>
                                Last 12 Months
                            </Typography>
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
                                {Array.isArray(trend12m) && trend12m.length > 0 ? (
                                    <Line
                                        data={{
                                            labels: trend12m.map(item => item.month || item.date || item.name || ''),
                                            datasets: [{
                                                label: 'Revenue',
                                                data: trend12m.map(item => item.revenue || item.amount || item.total || item.invoiceAmount || 0),
                                                borderColor: '#4A90E2',
                                                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                                                borderWidth: 2,
                                                fill: true,
                                                tension: 0.4,
                                                pointRadius: 3,
                                            }]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                                y: { border: { dash: [4, 4] }, grid: { color: '#eaeaea' }, ticks: { font: { size: 10 }, callback: (value) => '$' + value } }
                                            }
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body2" sx={{ color: '#999' }}>No data available</Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" sx={{ color: '#aaa', mb: 2, display: 'block' }}>
                                Top 5 Items
                            </Typography>
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
                                {Array.isArray(topItems) && topItems.length > 0 ? (
                                    <Pie
                                        data={{
                                            labels: topItems.map(item => item.itemName || item.name || `Item ${item.itemID || ''}`),
                                            datasets: [{
                                                data: topItems.map(item => item.amount || item.totalValue || item.quantity || item.qty || 1),
                                                backgroundColor: [
                                                    '#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'
                                                ],
                                                borderWidth: 0,
                                            }]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body2" sx={{ color: '#999' }}>No data available</Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    placeholder="Search Invoice No, Customer..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch color="#aaa" size={14} />
                            </InputAdornment>
                        ),
                        sx: { backgroundColor: '#fff', borderRadius: '8px', width: { xs: '100%', md: '300px' }, '& fieldset': { borderColor: '#eee' } }
                    }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus size={12} />}
                        onClick={() => navigate('/invoice/editor')}
                        sx={{ backgroundColor: '#1a1a1a', color: '#fff', textTransform: 'none', borderRadius: '8px', px: 3, py: 1, '&:hover': { backgroundColor: '#333' } }}
                    >
                        New Invoice
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FaFileExport size={14} />}
                        onClick={handleExport}
                        sx={{ color: '#555', borderColor: '#eee', textTransform: 'none', backgroundColor: '#fff', borderRadius: '8px', px: 2, '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#ddd' } }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FaColumns size={14} />}
                        sx={{ color: '#555', borderColor: '#eee', textTransform: 'none', backgroundColor: '#fff', borderRadius: '8px', px: 2, '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#ddd' } }}
                    >
                        Columns
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 900 }} aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#fcfcfc' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Invoice No</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Items</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Sub Total</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Tax %</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Tax Amt</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Total</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee', py: 2 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(!filteredInvoices || filteredInvoices.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#999' }}>
                                        No Invoices
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        const rowId =
                                            row.primaryKeyID ||
                                            row.invoiceID ||
                                            index;

                                        return (
                                            <TableRow hover tabIndex={-1} key={rowId}>
                                                <TableCell
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    {row.invoiceNo || '-'}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: '#555',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    {row.invoiceDate
                                                        ? new Date(row.invoiceDate).toLocaleDateString()
                                                        : '-'}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: '#555',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    {row.customerName || '-'}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: '#555',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    {row.totalItems || 0}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: '#555',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    $
                                                    {Number(row.subTotal || 0).toLocaleString(
                                                        undefined,
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: '#555',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    {Number(row.taxPercentage || 0).toFixed(2)}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: '#555',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    $
                                                    {Number(row.taxAmount || 0).toLocaleString(
                                                        undefined,
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    $
                                                    {Number(row.invoiceAmount || 0).toLocaleString(
                                                        undefined,
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                navigate(`/invoices/edit/${row.invoiceID}`)
                                                            }
                                                            sx={{
                                                                color: '#aaa',
                                                                '&:hover': { color: '#333' }
                                                            }}
                                                        >
                                                            <FaEdit size={14} />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handlePrint(row.invoiceID)}
                                                            sx={{
                                                                color: '#aaa',
                                                                '&:hover': { color: '#333' }
                                                            }}
                                                        >
                                                            <FaPrint size={14} />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(row.invoiceID)}
                                                            sx={{
                                                                color: '#aaa',
                                                                '&:hover': { color: '#d32f2f' }
                                                            }}
                                                        >
                                                            <FaTrash size={14} />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredInvoices.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid #eee' }}
                />
            </Paper>
        </Box>
    );
};

export default Invoices;
