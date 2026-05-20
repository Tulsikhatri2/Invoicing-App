import api from "../../../api/axiosIntercentors"
import { parseImageBlobResponse } from "../../../utils/imageBlob"

export const getData = async () => {
    const response = await api.get("/item/getlist")
    console.log(response.data, "data service response")
    return response.data
}

export const createItem = async (itemData) => {
    const response = await api.post("/Item", itemData)
    return response.data
}

export const updateItem = async (itemData) => {
    const response = await api.put("/Item", itemData)
    return response.data
}

export const deleteItem = async (id) => {
    const response = await api.delete(`/item/${id}`)
    return response.data
}

export const getInvoiceList = async (range) => {
    const response = await api.get("/Invoice/GetList", { params: { range } })
    return response.data
}

export const getInvoiceMetrics = async (fromDate, toDate) => {
    const response = await api.get("/Invoice/GetMetrices", { params: { fromDate, toDate } })
    return response.data
}

export const getTopItems = async (topN) => {
    const response = await api.get("/Invoice/TopItems", { params: { topN } })
    return response.data
}

export const getTrend12m = async (asOf) => {
    const response = await api.get("/Invoice/GetTrend12m", { params: { asOf } })
    return response.data
}

export const deleteInvoiceData = async (id) => {
    const response = await api.delete(`/Invoice/${id}`)
    return response.data
}

export const getInvoiceById = async (id) => {
    const response = await api.get(`/Invoice/${id}`)
    return response.data
}

export const saveInvoice = async (invoiceData) => {
    const response = await api.post("/Invoice/", invoiceData)
    return response.data
}

export const updateInvoice = async (invoiceData) => {
    const response = await api.put("/Invoice", invoiceData)
    return response.data
}

export const getItemById = async (id) => {
    const response = await api.get(`/Item/${id}`)
    return response.data
}

export const getItemLookupList = async () => {
    const response = await api.get("/Item/GetLookupList")
    return response.data
}

export const updateItemPicture = async (formData) => {
    const response = await api.post("/Item/UpdateItemPicture", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export const getItemPicture = async (id) => {
    if (id == null || id === '') return null
    try {
        const response = await api.get(`/Item/Picture/${id}`, { responseType: 'blob' })
        return await parseImageBlobResponse(response)
    } catch (error) {
        if (error.response?.status === 404) return null
        throw error
    }
}

export const getItemPictureThumbnail = async (id) => {
    if (id == null || id === '') return null
    try {
        const response = await api.get(`/Item/PictureThumbnail/${id}`, { responseType: 'blob' })
        return await parseImageBlobResponse(response)
    } catch (error) {
        if (error.response?.status === 404) return null
        throw error
    }
}