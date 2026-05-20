import api from '../../../api/axiosIntercentors'

export const registerUser = async (data) => {
  const formData = new FormData()
  formData.append('FirstName', data.firstName)
  formData.append('LastName', data.lastName)
  formData.append('Email', data.email)
  formData.append('Password', data.password)
  formData.append('CompanyName', data.companyName)
  formData.append('Address', data.address)
  formData.append('City', data.city)
  formData.append('ZipCode', data.zipCode)
  formData.append('Industry', data.industry || '')
  formData.append('CurrencySymbol', data.currencySymbol)

  if (data.logo) {
    formData.append('logo', data.logo)
  }

  const response = await api.post('/Auth/Signup', formData)
  return response.data
}

export const loginUser = async(loginData)=>{
const response = await api.post("/Auth/Login", loginData)
return response.data
}
