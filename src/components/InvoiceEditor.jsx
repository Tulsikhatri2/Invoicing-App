import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    InputAdornment
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaCopy, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getInvoiceListData, getListData, saveInvoiceData, getInvoiceByIdData, updateInvoiceData } from '../Redux/slices/data/dataSlice';

const InvoiceEditor = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { id } = useParams();
    const isEditing = Boolean(id);
    const [invoicesCount, setInvoicesCount] = useState("")
    const [itemsList, setItemsList] = useState([]);
    const { invoiceListData } = useSelector((state) => state.data);
    console.log(invoiceListData, "from InvoiceEditor")


    const [lineItems, setLineItems] = useState([
        { id: 1, item: '', description: '', qty: 0, rate: 0, discPct: 0 }
    ]);

    const [taxPct, setTaxPct] = useState(0);

    useEffect(() => {
        const fetchListData = async () => {
            const response = await dispatch(getListData())
            setItemsList(response.payload || []);
        }
        const fetchInvoicesData = async () => {
            const response = await dispatch(getInvoiceListData())
            setInvoicesCount(response?.payload?.length + 1)
        }

        fetchListData();

        if (isEditing) {
            const fetchInvoiceData = async () => {
                const response = await dispatch(getInvoiceByIdData(id));
                if (response.payload) {
                    const data = response.payload;
                    formik.setValues({
                        invoiceNo: data.invoiceNo || '',
                        invoiceDate: data.invoiceDate ? data.invoiceDate.split('T')[0] : '',
                        customerName: data.customerName || '',
                        city: data.city || '',
                        address: data.address || '',
                        notes: data.notes || ''
                    });
                    setTaxPct(data.taxPercentage || 0);
                    if (data.lines && data.lines.length > 0) {
                        setLineItems(data.lines.map((line, index) => ({
                            id: index + 1,
                            item: line.itemID || '',
                            description: line.description || '',
                            qty: line.quantity || 0,
                            rate: line.rate || 0,
                            discPct: line.discountPct || 0
                        })));
                    }
                }
            };
            fetchInvoiceData();
        } else {
            fetchInvoicesData();
        }
    }, [dispatch, id, isEditing]);

    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {
            invoiceNo: invoicesCount,
            invoiceDate: '2025-01-15',
            customerName: '',
            city: '',
            address: '',
            notes: ''
        },
        validationSchema: Yup.object({
            invoiceNo: Yup.string().required('invoice no exist'),
            invoiceDate: Yup.string().required('pick a date'),
            customerName: Yup.string().required('enter name')
        }),
        onSubmit: async (values) => {
            const payload = {
                ...(isEditing && { invoiceID: Number(id) }),
                invoiceNo: Number(values.invoiceNo),
                invoiceDate: values.invoiceDate,
                customerName: values.customerName,
                address: values.address,
                city: values.city || null,
                taxPercentage: Number(taxPct),
                notes: values.notes,
                lines: lineItems.map((item, index) => ({
                    rowNo: index + 1,
                    itemID: Number(item.item) || 0,
                    description: item.description,
                    quantity: Number(item.qty),
                    rate: Number(item.rate),
                    discountPct: Number(item.discPct)
                }))
            };

            console.log("Payload => ", payload);
            try {
                let response;
                if (isEditing) {
                    response = await dispatch(updateInvoiceData(payload));
                } else {
                    response = await dispatch(saveInvoiceData(payload));
                }

                console.log(response, "save invoice response")
                if (response.payload) {
                    navigate('/invoices')
                    formik.resetForm({
                        values: {
                            invoiceNo: invoicesCount + 1,
                            invoiceDate: '2025-01-15',
                            customerName: '',
                            city: '',
                            address: '',
                            notes: ''
                        }
                    });
                    setLineItems([
                        {
                            id: 1,
                            item: '',
                            description: '',
                            qty: 0,
                            rate: 0,
                            discPct: 0
                        }
                    ]);
                    setTaxPct(0);
                }
            } catch (error) {

            }

        }
    });

    const handleItemChange = (index, field, value) => {
        const newItems = [...lineItems];
        newItems[index][field] = value;
        setLineItems(newItems);
    };

    const handleAddRow = () => {
        setLineItems([...lineItems, { id: Date.now(), item: '', description: '', qty: 0, rate: 0, discPct: 0 }]);
    };

    const handleDeleteRow = (index) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index));
        }
    };

    const handleCopyRow = (index) => {
        const rowToCopy = lineItems[index];
        setLineItems([...lineItems, { ...rowToCopy, id: Date.now() }]);
    };

    const calculateRowAmount = (row) => {
        const qty = Number(row.qty) || 0;
        const rate = Number(row.rate) || 0;
        const discPct = Number(row.discPct) || 0;
        const base = qty * rate;
        return base - (base * (discPct / 100));
    };

    const subTotal = lineItems.reduce((sum, row) => sum + calculateRowAmount(row), 0);
    const taxAmount = subTotal * (Number(taxPct) / 100);
    const totalAmount = subTotal + taxAmount;

    return (
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid #f0f0f0', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#333' }}>
                    {isEditing ? `Edit Invoice (${id})` : 'New Invoice'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="text" onClick={() => navigate('/invoices')} sx={{ color: '#666', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#111', color: '#fff', textTransform: 'none', px: 3, '&:hover': { backgroundColor: '#333' }, borderRadius: '6px' }}>
                        Save
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 4, mb: 4, borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 4, color: '#444' }}>
                    Invoice Details
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 500 }}>Invoice No</Typography>
                        <TextField
                            fullWidth size="small"
                            name="invoiceNo" value={formik.values.invoiceNo} onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.invoiceNo && Boolean(formik.errors.invoiceNo)}
                            placeholder="Invoice Number"
                            helperText={(formik.touched.invoiceNo && formik.errors.invoiceNo) || "Auto next available number"}
                            FormHelperTextProps={{ sx: { mx: 0, mt: 0.5, fontSize: '0.75rem', color: (formik.touched.invoiceNo && formik.errors.invoiceNo) ? '#d32f2f' : '#999' } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 500 }}>Invoice Date *</Typography>
                        <TextField
                            fullWidth size="small" type="date"
                            name="invoiceDate" value={formik.values.invoiceDate} onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.invoiceDate && Boolean(formik.errors.invoiceDate)}
                            helperText={formik.touched.invoiceDate && formik.errors.invoiceDate}
                            FormHelperTextProps={{ sx: { mx: 0, mt: 0.5, fontSize: '0.75rem' } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 500 }}>Customer Name *</Typography>
                        <TextField
                            fullWidth size="small"
                            name="customerName" value={formik.values.customerName} onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                            helperText={formik.touched.customerName && formik.errors.customerName}
                            FormHelperTextProps={{ sx: { mx: 0, mt: 0.5, fontSize: '0.75rem' } }}
                            placeholder="Enter customer name"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 500 }}>City</Typography>
                        <TextField
                            fullWidth size="small"
                            name="city" value={formik.values.city} onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter city"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 500 }}>Address</Typography>
                        <TextField
                            fullWidth multiline rows={3}
                            name="address" value={formik.values.address} onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter address"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 500 }}>Notes</Typography>
                        <TextField
                            fullWidth multiline rows={3}
                            name="notes" value={formik.values.notes} onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Additional notes"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 4, mb: 4, borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#444' }}>
                        Line Items
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" size="small" startIcon={<FaPlus size={10} />} onClick={handleAddRow} sx={{ textTransform: 'none', color: '#555', borderColor: '#eaeaea', borderRadius: '6px' }}>Add Row</Button>
                        <Button variant="outlined" size="small" startIcon={<FaCopy size={12} />} onClick={() => handleCopyRow(lineItems.length - 1)} sx={{ textTransform: 'none', color: '#555', borderColor: '#eaeaea', borderRadius: '6px' }}>Copy</Button>
                        <Button variant="outlined" size="small" startIcon={<FaTrash size={10} />} onClick={() => handleDeleteRow(lineItems.length - 1)} sx={{ textTransform: 'none', color: '#555', borderColor: '#eaeaea', borderRadius: '6px' }}>Delete</Button>
                    </Box>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', px: 1 }}>S.No</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', width: '22%' }}>Item *</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', width: '30%' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', width: '10%' }}>Qty *</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', width: '12%' }}>Rate *</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', width: '10%' }}>Disc %</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', width: '12%', px: 1 }}>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lineItems.map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell sx={{ borderBottom: 'none', pt: 2, pb: 1, px: 1, verticalAlign: 'top', fontSize: '0.875rem' }}>{index + 1}</TableCell>
                                    <TableCell sx={{ borderBottom: 'none', pt: 2, pb: 1, verticalAlign: 'top' }}>

                                        <Select
                                            fullWidth
                                            size="small"
                                            displayEmpty
                                            value={row.item}
                                            onChange={(e) => {

                                                const selectedItem = itemsList.find(
                                                    (item) => item.itemID === e.target.value
                                                );

                                                const updatedItems = [...lineItems];

                                                updatedItems[index].item = selectedItem.itemID;

                                                updatedItems[index].description =
                                                    selectedItem.description || '';

                                                updatedItems[index].rate =
                                                    selectedItem.rate || 0;

                                                setLineItems(updatedItems);
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#eaeaea'
                                                },
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                backgroundColor: '#fff'
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                Select item...
                                            </MenuItem>

                                            {itemsList.map((item) => (
                                                <MenuItem
                                                    key={item.itemID}
                                                    value={item.itemID}
                                                >
                                                    {item.itemName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: 'none', pt: 2, pb: 1, verticalAlign: 'top' }}>
                                        <TextField
                                            fullWidth size="small" placeholder="Description"
                                            value={row.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', backgroundColor: '#fff' }, '& input': { fontSize: '0.875rem' }, '& fieldset': { borderColor: '#eaeaea' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: 'none', pt: 2, pb: 1, verticalAlign: 'top' }}>
                                        <TextField
                                            fullWidth size="small" placeholder="0.00" type="number"
                                            value={row.qty || ''} onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', backgroundColor: '#fff' }, '& input': { fontSize: '0.875rem' }, '& fieldset': { borderColor: '#eaeaea' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: 'none', pt: 2, pb: 1, verticalAlign: 'top' }}>
                                        <TextField
                                            fullWidth size="small" placeholder="0.00" type="number"
                                            value={row.rate || ''} onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', backgroundColor: '#fff' }, '& input': { fontSize: '0.875rem' }, '& fieldset': { borderColor: '#eaeaea' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: 'none', pt: 2, pb: 1, verticalAlign: 'top' }}>
                                        <TextField
                                            fullWidth size="small" placeholder="0.00" type="number"
                                            value={row.discPct || ''} onChange={(e) => handleItemChange(index, 'discPct', e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', backgroundColor: '#fff' }, '& input': { fontSize: '0.875rem' }, '& fieldset': { borderColor: '#eaeaea' } }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: 'none', pt: 2.5, pb: 1, fontWeight: 600, color: '#333', verticalAlign: 'top', px: 1 }}>
                                        ${calculateRowAmount(row).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, px: 1 }}>
                    <Box sx={{ display: 'flex', width: '25%', justifyContent: 'flex-end', gap: 6 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>Subtotal:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>${subTotal.toFixed(2)}</Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: 'none', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#444', mb: { xs: 3, md: 0 } }}>
                    Invoice Totals
                </Typography>
                <Box sx={{ width: { xs: '100%', md: '450px' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pr: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, flex: 1 }}>Sub Total</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', flexShrink: 0 }}>${subTotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pr: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, flex: 1 }}>Tax</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                size="small" type="number" value={taxPct || ''} onChange={(e) => setTaxPct(e.target.value)} placeholder="0.00"
                                InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="body2" sx={{ color: '#999' }}>%</Typography></InputAdornment> }}
                                sx={{ width: '110px', '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '36px' }, '& input': { fontSize: '0.875rem', textAlign: 'right' }, '& fieldset': { borderColor: '#eaeaea' } }}
                            />
                            <TextField
                                size="small" value={`$${taxAmount.toFixed(2)}`} disabled
                                sx={{ width: '110px', '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '36px', backgroundColor: '#fcfcfc' }, '& input': { fontSize: '0.875rem', textAlign: 'right', WebkitTextFillColor: '#999' }, '& fieldset': { borderColor: '#eaeaea' } }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, backgroundColor: '#f9fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>Invoice Amount</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111' }}>${totalAmount.toFixed(2)}</Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default InvoiceEditor;
