import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createItem, deleteItem, getData, getInvoiceList, getInvoiceMetrics, getTopItems, getTrend12m, deleteInvoiceData as deleteInvoiceService, updateItem, saveInvoice, getInvoiceById, updateInvoice, getItemById, getItemLookupList, updateItemPicture, getItemPicture, getItemPictureThumbnail } from "./dataService";

const dataSlice = createSlice({
    name: "data",
    initialState: {
        listData: [],
        isLoading: false,
        isSuccess: false,
        invoiceListData: [],
        invoiceMetrics: null,
        topItems: [],
        trend12m: null
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getListData.pending, (state) => {
                state.isLoading = true
                state.isSuccess = false
            })
            .addCase(getListData.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.listData = action.payload
            })
            .addCase(getListData.rejected, (state) => {
                state.isLoading = false
                state.isSuccess = false
            })
            .addCase(createItemData.pending, (state) => {
                state.isLoading = true
                state.isSuccess = false
            })
            .addCase(createItemData.fulfilled, (state) => {
                state.isLoading = false
                state.isSuccess = true
            })
            .addCase(createItemData.rejected, (state) => {
                state.isLoading = false
                state.isSuccess = false
            })
            .addCase(updateItemData.pending, (state) => {
                state.isLoading = true
                state.isSuccess = false
            })
            .addCase(updateItemData.fulfilled, (state) => {
                state.isLoading = false
                state.isSuccess = true
            })
            .addCase(updateItemData.rejected, (state) => {
                state.isLoading = false
                state.isSuccess = false
            })
            .addCase(deleteItemData.pending, (state) => {
                state.isLoading = true
                state.isSuccess = false
            })
            .addCase(deleteItemData.fulfilled, (state) => {
                state.isLoading = false
                state.isSuccess = true
            })
            .addCase(deleteItemData.rejected, (state) => {
                state.isLoading = false
                state.isSuccess = false
            })
            .addCase(getInvoiceListData.pending, (state) => {
                state.isLoading = true
                state.isSuccess = false
            })
            .addCase(getInvoiceListData.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.invoiceListData = action.payload
            })
            .addCase(getInvoiceListData.rejected, (state) => {
                state.isLoading = false
                state.isSuccess = false
            })
            .addCase(getInvoiceMetricsData.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getInvoiceMetricsData.fulfilled, (state, action) => {
                state.isLoading = false
                state.invoiceMetrics = action.payload
            })
            .addCase(getInvoiceMetricsData.rejected, (state) => {
                state.isLoading = false
            })
            .addCase(getTopItemsData.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getTopItemsData.fulfilled, (state, action) => {
                state.isLoading = false
                state.topItems = action.payload
            })
            .addCase(getTopItemsData.rejected, (state) => {
                state.isLoading = false
            })
            .addCase(getTrend12mData.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getTrend12mData.fulfilled, (state, action) => {
                state.isLoading = false
                state.trend12m = action.payload
            })
            .addCase(getTrend12mData.rejected, (state) => {
                state.isLoading = false
            })
            .addCase(deleteInvoiceAction.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteInvoiceAction.fulfilled, (state) => {
                state.isLoading = false
            })
            .addCase(deleteInvoiceAction.rejected, (state) => {
                state.isLoading = false
            })
    }
})

export const getListData = createAsyncThunk(
    "DATA/GETLISTDATA",
    async () => {
        try {
            const response = await getData()
            console.log(response, "list data response")
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const createItemData = createAsyncThunk(
    "DATA/CREATEITEMDATA",
    async (itemData) => {
        try {
            const response = await createItem(itemData)
            console.log(response, "create item data response")
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const updateItemData = createAsyncThunk(
    "DATA/UPDATEITEMDATA",
    async (itemData) => {
        try {
            const response = await updateItem(itemData)
            console.log(response, "update item data response")
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const deleteItemData = createAsyncThunk(
    "DATA/DELETEITEMDATA",
    async (itemData) => {
        try {
            const response = await deleteItem(itemData)
            console.log(response, "delete item data response")
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const getInvoiceListData = createAsyncThunk(
    "DATA/GETINVOICELISTDATA",
    async (range) => {
        try {
            const response = await getInvoiceList(range)
            console.log(response, "invoice list data response")
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const getInvoiceMetricsData = createAsyncThunk(
    "DATA/GETINVOICEMETRICSDATA",
    async ({ fromDate, toDate }) => {
        try {
            const response = await getInvoiceMetrics(fromDate, toDate)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const getTopItemsData = createAsyncThunk(
    "DATA/GETTOPITEMSDATA",
    async (topN) => {
        try {
            const response = await getTopItems(topN)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const getTrend12mData = createAsyncThunk(
    "DATA/GETTREND12MDATA",
    async (asOf) => {
        try {
            const response = await getTrend12m(asOf)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const deleteInvoiceAction = createAsyncThunk(
    "DATA/DELETEINVOICEDATA",
    async (id) => {
        try {
            const response = await deleteInvoiceService(id)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const saveInvoiceData = createAsyncThunk(
    "DATA/SAVEINVOICEDATA",
    async (invoiceData) => {
        try {
            const response = await saveInvoice(invoiceData)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const getInvoiceByIdData = createAsyncThunk(
    "DATA/GETINVOICEBYID",
    async (id) => {
        try {
            const response = await getInvoiceById(id)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const updateInvoiceData = createAsyncThunk(
    "DATA/UPDATEINVOICEDATA",
    async (invoiceData) => {
        try {
            const response = await updateInvoice(invoiceData)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const getItemByIdData = createAsyncThunk(
    "DATA/GETITEMBYID",
    async (id) => {
        try {
            const response = await getItemById(id)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const getItemLookupListData = createAsyncThunk(
    "DATA/GETITEMLOOKUPLIST",
    async () => {
        try {
            const response = await getItemLookupList()
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
        }
    }
)

export const updateItemPictureData = createAsyncThunk(
    "DATA/UPDATEITEMPICTURE",
    async (formData) => {
        try {
            const response = await updateItemPicture(formData)
            return response
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
            throw error
        }
    }
)

export const getItemPictureData = createAsyncThunk(
    "DATA/GETITEMPICTURE",
    async (id) => {
        if (id == null || id === '') return null
        try {
            return await getItemPicture(id)
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
            return null
        }
    }
)

export const getItemPictureThumbnailData = createAsyncThunk(
    "DATA/GETITEMPICTURETHUMBNAIL",
    async (id) => {
        if (id == null || id === '') return null
        try {
            return await getItemPictureThumbnail(id)
        }
        catch (error) {
            console.error(error.response?.data?.message || error.message)
            return null
        }
    }
)

export default dataSlice.reducer