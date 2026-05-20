import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FaImage, FaTimes } from 'react-icons/fa';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { useDispatch, useSelector } from 'react-redux';
import { createItemData, updateItemData, getItemByIdData, getItemPictureData, updateItemPictureData } from '../Redux/slices/data/dataSlice';
import { getItemId } from '../utils/itemHelpers';

const ItemSchema = Yup.object().shape({
  itemName: Yup.string().required('Item Name is required'),
  description: Yup.string(),
  salesRate: Yup.number().required('Sale Rate is required').min(0, 'Must be greater than or equal to 0'),
  discountPct: Yup.number().min(0, 'Must be at least 0').max(100, 'Cannot exceed 100'),
});

const ItemModal = ({ open, handleClose, editMode, setEditMode, initialData, onSuccess }) => {
  const [apiError, setApiError] = useState('');
  const [picturePreview, setPicturePreview] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);
  const { loading } = useSelector((state) => state.data)
  const dispatch = useDispatch()

  useEffect(() => {
    if (open) {
      setApiError('');
      if (editMode && initialData) {
        const id = getItemId(initialData);
        setItemDetails(initialData);
        
        const fetchItem = async () => {
          try {
            const res = await dispatch(getItemByIdData(id));
            if (res.payload) {
                setItemDetails(res.payload);
            }
            const picRes = await dispatch(getItemPictureData(id));
            if (picRes.payload instanceof Blob && picRes.payload.size > 0) {
                const imageUrl = URL.createObjectURL(picRes.payload);
                setPicturePreview(imageUrl);
            } else {
                setPicturePreview(null);
            }
          } catch (error) {
              console.error("Error fetching item details or picture", error);
          }
        };
        fetchItem();
      } else {
        setItemDetails(null);
        setPicturePreview(null);
      }
    }
  }, [open, editMode, initialData, dispatch]);

  const initialValues = {
    itemName: itemDetails?.itemName || itemDetails?.ItemName || itemDetails?.name || '',
    description: itemDetails?.description || itemDetails?.Description || '',
    salesRate: itemDetails?.salesRate || itemDetails?.SalesRate || itemDetails?.price || 0,
    discountPct: itemDetails?.discountPct || itemDetails?.DiscountPct || 0,
    picture: null,
  };


  const handleSubmit = async (values, { setSubmitting }) => {
    setApiError('');
    try {
      let itemIdToUpdate = null;
      if (editMode) {
        const payload = {
          updatedOn: null,
          itemID: itemDetails?.itemID || initialData?.itemID,
          itemName: values.itemName,
          description: values.description,
          salesRate: Number(values.salesRate),
          discountPct: Number(values.discountPct)
        }
        const res = await dispatch(updateItemData(payload));
        if (res.payload) {
            itemIdToUpdate = payload.itemID;
        }
        setEditMode(false);
      }
      else {
        const payload = {
          itemName: values.itemName,
          description: values.description,
          salesRate: Number(values.salesRate),
          discountPct: Number(values.discountPct),
        };

        const res = await dispatch(createItemData(payload));
        if (res.payload) {
            itemIdToUpdate = res.payload.itemID || res.payload.id || (typeof res.payload === 'number' ? res.payload : null);
        }
      }

      if (values.picture && itemIdToUpdate) {
        const formData = new FormData();
        formData.append('ItemID', itemIdToUpdate);
        formData.append('File', values.picture);
        await dispatch(updateItemPictureData(formData));
      }

      onSuccess();
      handleClose();
    } catch (error) {
      setApiError(getApiErrorMessage(error, `Failed to ${editMode ? 'update' : 'add'} item. Please try again.`));
    } finally {
      setSubmitting(false);
    }
  };

  console.log(editMode, "edit mode")

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          {editMode ? 'Edit Item' : 'Add New Item'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <FaTimes size={18} />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={ItemSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => {
          const handlePictureChange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFieldValue('picture', file);
              setPicturePreview(URL.createObjectURL(file));
            }
          };

          return (
            <Form noValidate>
              <DialogContent dividers>
                {apiError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {apiError}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      minWidth: 80,
                      borderRadius: '8px',
                      border: '1px dashed #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5',
                      position: 'relative',
                    }}
                  >
                    {picturePreview ? (
                      <img
                        src={picturePreview}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FaImage size={24} color="#bbb" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      Item Picture
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click the box to upload an image.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Item Name*"
                    name="itemName"
                    value={values.itemName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.itemName && Boolean(errors.itemName)}
                    helperText={touched.itemName && errors.itemName}
                    size="small"
                    fullWidth
                  />

                  <TextField
                    label="Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    size="small"
                    multiline
                    rows={3}
                    fullWidth
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Sale Rate*"
                      name="salesRate"
                      type="number"
                      value={values.salesRate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.salesRate && Boolean(errors.salesRate)}
                      helperText={touched.salesRate && errors.salesRate}
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, color: '#777' }}>$</Typography>,
                      }}
                    />

                    <TextField
                      label="Discount %"
                      name="discountPct"
                      type="number"
                      value={values.discountPct}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.discountPct && Boolean(errors.discountPct)}
                      helperText={touched.discount && errors.discount}
                      size="small"
                      fullWidth
                      InputProps={{
                        endAdornment: <Typography sx={{ ml: 1, color: '#777' }}>%</Typography>,
                      }}
                    />
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} sx={{ textTransform: 'none', color: '#666' }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: '#444',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#333' },
                  }}
                >
                  {isSubmitting ? 'Saving...' : editMode ? 'Update Item' : 'Add Item'}
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default ItemModal;
