import api from "../api";

export const UpdateToken = async (data) => {
    try{
        const apiEndpoint = "/google_token/";
        let apiResponse = await api.post(apiEndpoint, data);
    }catch(e){
        console.log(e)
    }
}