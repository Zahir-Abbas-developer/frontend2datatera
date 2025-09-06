import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const VerifyUser = () => {
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const verify = async (email,password) => {
        try{
            const res = await api.post("/user/verify", {
                email: email,
                password: password
            });
            navigate('/');

            toast(t('toasts.activation.emailVerified'), {
                type: 'success',
              })
        }catch(e){
            console.log('Error',e);
            toast(e?.response?.data?.message, {
                type: 'error',
              })
        }
    }

  useEffect(() => {
    if(queryParams){
        verify(queryParams.email,queryParams.code)
    }
  }, [queryParams]);

   return <div className='d-flex justify-content-center align-items-center w-100' style={{height:'95vh'}}>User Verification in progress!</div> 
}
export default VerifyUser;