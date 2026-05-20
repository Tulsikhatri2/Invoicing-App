import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { FaImage } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { getItemPictureData, getItemPictureThumbnailData } from '../Redux/slices/data/dataSlice';

/** Loads item image via GET /Item/Picture/{id}, falls back to PictureThumbnail. */
const ItemPicture = ({ itemId, size = 40, borderRadius = '6px', refreshKey = 0 }) => {
    const dispatch = useDispatch();
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!itemId) {
            setImageUrl(null);
            setLoading(false);
            return undefined;
        }

        let cancelled = false;
        let objectUrl = null;

        const load = async () => {
            setLoading(true);
            try {
                const pictureResult = await dispatch(getItemPictureData(itemId));
                let blob = pictureResult.payload;
                if (!(blob instanceof Blob && blob.size > 0)) {
                    const thumbResult = await dispatch(getItemPictureThumbnailData(itemId));
                    blob = thumbResult.payload;
                }
                if (cancelled) return;

                if (blob instanceof Blob && blob.size > 0) {
                    objectUrl = URL.createObjectURL(blob);
                    setImageUrl((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        return objectUrl;
                    });
                } else {
                    setImageUrl((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        return null;
                    });
                }
            } catch {
                if (!cancelled) {
                    setImageUrl((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        return null;
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            setImageUrl((prev) => {
                if (prev && prev !== objectUrl) URL.revokeObjectURL(prev);
                return null;
            });
        };
    }, [dispatch, itemId, refreshKey]);

    return (
        <Box
            sx={{
                width: size,
                height: size,
                backgroundColor: '#e9ecef',
                borderRadius,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
            }}
        >
            {loading ? (
                <CircularProgress size={size > 50 ? 20 : 16} sx={{ color: '#adb5bd' }} />
            ) : imageUrl ? (
                <img
                    src={imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius }}
                />
            ) : (
                <FaImage color="#adb5bd" size={size > 50 ? 24 : 16} />
            )}
        </Box>
    );
};

export default ItemPicture;
