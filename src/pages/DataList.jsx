import React, { useState, useEffect } from 'react';
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
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Stack,
    Menu,
    MenuItem,
    Checkbox,
    ListItemText,
    TableSortLabel,
} from '@mui/material';
import {
    FaSearch,
    FaPlus,
    FaFileExport,
    FaColumns,
    FaEdit,
    FaTrash,
} from 'react-icons/fa';
import { deleteItemData, getListData } from '../Redux/slices/data/dataSlice';
import { useDispatch, useSelector } from 'react-redux';
import ItemModal from '../components/ItemModal';
import ItemPicture from '../components/ItemPicture';
import Loader from '../components/Loader';
import { getItemId } from '../utils/itemHelpers';
import LogoutButton from '../components/LogoutButton';
import * as XLSX from 'xlsx';

const DataList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const items = useSelector((state) => state.data?.listData || []);
    const { isLoading } = useSelector((state) => state.data);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');
    const [pictureRefreshKey, setPictureRefreshKey] = useState(0);
    const [visibleColumns, setVisibleColumns] = useState({
        picture: true,
        itemName: true,
        description: true,
        saleRate: true,
        discount: true,
        actions: true,
    });
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getListData())
    }, [dispatch]);

    const handleOpenAdd = () => {
        setEditMode(false);
        setSelectedItem(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditMode(true);
        setSelectedItem(item);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedItem(null);
    };

    const handleColumnsClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleColumnsClose = () => {
        setAnchorEl(null);
    };

    const handleColumnToggle = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const handleModalSuccess = () => {
        dispatch(getListData());
        setPictureRefreshKey((k) => k + 1);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredItems = items.filter((item) => {
        const itemName = item.itemName || item.ItemName || item.name || item.Name || '';
        return itemName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleDeleteItem = async (item) => {
        const response = await dispatch(deleteItemData(item?.itemID))
        console.log(response, "delete response")
        handleModalSuccess()
    }

    const handleExport = () => {
        const exportData = filteredItems.map(item => ({
            'Item Name': item.itemName || '',
            'Description': item.description || '',
            'Sale Rate': Number(item.salesRate || 0).toFixed(2),
            'Discount %': Number(item.discountPct || 0).toFixed(2)
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
        XLSX.writeFile(workbook, "Items_Export.xlsx");
    };

    const getSortValue = (item, prop) => {
        switch (prop) {
            case 'itemName': return item.itemName || item.ItemName || item.name || item.Name || '';
            case 'description': return item.description || item.Description || item.desc || '';
            case 'salesRate': return Number(item.salesRate || item.SaleRate || item.saleRate || item.price || 0);
            case 'discountPct': return Number(item.discountPct || item.DiscountPct || item.Discount || item.discount || item.discountPercent || 0);
            default: return item[prop] || '';
        }
    };

    const sortedItems = [...filteredItems].sort((a, b) => {
        if (!orderBy) return 0;
        let valA = getSortValue(a, orderBy);
        let valB = getSortValue(b, orderBy);
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedItems = sortedItems.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    console.log(filteredItems, "paginated items")

    return (
        <Box sx={{ p: 4, backgroundColor: '#f9fafc', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: '500', mb: 0.5, color: '#333' }}>
                        Items
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#777' }}>
                        Manage your product and service catalog.
                    </Typography>
                </Box>
                <LogoutButton />
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ backgroundColor: '#fff', width: '320px', '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch color="#aaa" size={14} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus size={14} />}
                        onClick={handleOpenAdd}
                        sx={{
                            backgroundColor: '#444',
                            textTransform: 'none',
                            boxShadow: 'none',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            '&:hover': { backgroundColor: '#333', boxShadow: 'none' },
                        }}
                    >
                        Add New Item
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FaFileExport size={14} />}
                        onClick={handleExport}
                        sx={{
                            color: '#555',
                            borderColor: '#e0e0e0',
                            textTransform: 'none',
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#ccc' },
                        }}
                    >
                        Export
                    </Button>
                    <IconButton
                        onClick={handleColumnsClick}
                        sx={{
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            padding: '8px',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                    >
                        <FaColumns size={14} color="#555" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleColumnsClose}
                        PaperProps={{ sx: { width: 200, mt: 1 } }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {Object.keys(visibleColumns).map((col) => (
                            <MenuItem key={col} onClick={() => handleColumnToggle(col)} sx={{ py: 0 }}>
                                <Checkbox checked={visibleColumns[col]} size="small" sx={{ pointerEvents: 'none' }} />
                                <ListItemText primary={col === 'itemName' ? 'Item Name' : col === 'saleRate' ? 'Sale Rate' : col === 'discount' ? 'Discount %' : col.charAt(0).toUpperCase() + col.slice(1)} />
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Box>
            {isLoading ? <Loader /> :
                isMobile ? (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Stack spacing={2}>
                            {paginatedItems.map((item, index) => (
                                <Card key={getItemId(item) ?? index} sx={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #eee', overflow: 'visible' }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <ItemPicture itemId={getItemId(item)} size={60} refreshKey={pictureRefreshKey} />
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#444', lineHeight: 1.2, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.itemName}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', ml: 1, flexShrink: 0 }}>
                                                        <IconButton size="small" sx={{ p: 0.5, color: '#777', mr: 0.5, '&:hover': { color: '#333' } }} onClick={() => handleOpenEdit(item)}>
                                                            <FaEdit size={16} />
                                                        </IconButton>
                                                        <IconButton size="small" sx={{ p: 0.5, color: '#777', '&:hover': { color: '#d32f2f' } }} onClick={() => handleDeleteItem(item)}>
                                                            <FaTrash size={16} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#777', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, minHeight: '40px' }}>
                                                    {item.description}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                                                        ${Number(item.salesRate || 0).toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666', backgroundColor: '#f0f0f0', px: 1, py: 0.25, borderRadius: '4px' }}>
                                                        {Number(item.discountPct || 0).toFixed(2)}% Off
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                            {paginatedItems.length === 0 && (
                                <Box sx={{ py: 6, textAlign: 'center', color: '#999', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                                    No items found
                                </Box>
                            )}
                        </Stack>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredItems.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{ mt: 2, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                        />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#fcfcfc' }}>
                                        {visibleColumns.picture && <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee' }}>Picture</TableCell>}
                                        {visibleColumns.itemName && (
                                            <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee' }}>
                                                <TableSortLabel active={orderBy === 'itemName'} direction={orderBy === 'itemName' ? order : 'asc'} onClick={() => handleRequestSort('itemName')}>
                                                    Item Name
                                                </TableSortLabel>
                                            </TableCell>
                                        )}
                                        {visibleColumns.description && (
                                            <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee' }}>
                                                <TableSortLabel active={orderBy === 'description'} direction={orderBy === 'description' ? order : 'asc'} onClick={() => handleRequestSort('description')}>
                                                    Description
                                                </TableSortLabel>
                                            </TableCell>
                                        )}
                                        {visibleColumns.saleRate && (
                                            <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee' }}>
                                                <TableSortLabel active={orderBy === 'salesRate'} direction={orderBy === 'salesRate' ? order : 'asc'} onClick={() => handleRequestSort('salesRate')}>
                                                    Sale Rate
                                                </TableSortLabel>
                                            </TableCell>
                                        )}
                                        {visibleColumns.discount && (
                                            <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee' }}>
                                                <TableSortLabel active={orderBy === 'discountPct'} direction={orderBy === 'discountPct' ? order : 'asc'} onClick={() => handleRequestSort('discountPct')}>
                                                    Discount %
                                                </TableSortLabel>
                                            </TableCell>
                                        )}
                                        {visibleColumns.actions && <TableCell sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem', borderBottom: '1px solid #eee' }} align="right">Actions</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedItems.map((item, index) => (
                                            <TableRow hover tabIndex={-1} key={getItemId(item) ?? index}>
                                                {visibleColumns.picture && (
                                                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                                                        <ItemPicture itemId={getItemId(item)} size={40} refreshKey={pictureRefreshKey} />
                                                    </TableCell>
                                                )}
                                                {visibleColumns.itemName && <TableCell sx={{ fontWeight: 500, color: '#444', borderBottom: '1px solid #eee' }}>{item.itemName}</TableCell>}
                                                {visibleColumns.description && <TableCell sx={{ color: '#777', borderBottom: '1px solid #eee' }}>{item.description}</TableCell>}
                                                {visibleColumns.saleRate && (
                                                    <TableCell sx={{ color: '#444', fontWeight: 500, borderBottom: '1px solid #eee' }}>
                                                        ${Number(item.salesRate || 0).toFixed(2)}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.discount && (
                                                    <TableCell sx={{ color: '#444', borderBottom: '1px solid #eee' }}>
                                                        {Number(item.discountPct || 0).toFixed(2)}%
                                                    </TableCell>
                                                )}
                                                {visibleColumns.actions && (
                                                    <TableCell align="right" sx={{ borderBottom: '1px solid #eee' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenEdit(item)}
                                                            sx={{ color: '#777', mr: 0.5, '&:hover': { color: '#333' } }}
                                                        >
                                                            <FaEdit size={16} />
                                                        </IconButton>
                                                        <IconButton size="small" sx={{ color: '#777', '&:hover': { color: '#d32f2f' } }} onClick={() => { handleDeleteItem(item) }}>
                                                            <FaTrash size={16} />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                    ))}
                                    {paginatedItems.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} align="center" sx={{ py: 6, color: '#999' }}>
                                                No items found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredItems.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{ borderTop: '1px solid #eee' }}
                        />
                    </Paper>
                )
            }

            <ItemModal
                open={modalOpen}
                handleClose={handleCloseModal}
                editMode={editMode}
                setEditMode={setEditMode}
                initialData={selectedItem}
                onSuccess={handleModalSuccess}
            />
        </Box>
    );
};

export default DataList;