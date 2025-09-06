import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { AuthContext } from '@/context/auth';
import { auth, provider } from '@/config/firebaseConfig';
import api from '@/api';
import { useTranslation } from 'react-i18next';

const Signin = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginSuccess } = useContext(AuthContext);

  // ✅ Validation schema
  const validationSchema = yup.object({
    email: yup.string().email(t('signIn.validation.emailInvalid')).required(t('signIn.validation.emailRequired')),
    password: yup.string().min(6, t('signIn.validation.passwordMinLength')).required(t('signIn.validation.passwordRequired')),
  });

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);


        // API call
        const res = await api.post('/user/login', values);

        if (!res?.data) {
          throw new Error("No response data from API");
        }

        // Check if loginSuccess is available
        if (typeof loginSuccess !== "function") {
          throw new Error("loginSuccess is not defined or not a function");
        }

        // Store user in context
        const token = res.data.token;
        const user = res.data.data?.user || res.data.user; // handle both possible shapes

        loginSuccess(token, user);

        toast.success(t('Login Success'));
        navigate('/'); // ✅ Redirect to dashboard
        resetForm();
      } catch (error) {
        console.error("❌ Login error:", error);
        toast.error(error?.response?.data?.message || error.message || t('Login Failed.'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  // ✅ Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const data = {
        name: result?.user?.displayName,
        email: result?.user?.email,
        photo: result?.user?.photoURL,
        token: result?.user?.accessToken,
      };

      const res = await api.post('/user/googleSignin', data);

      // Store user in context
      loginSuccess(res.data.token, res.data.data.user);

      toast.success(t('toasts.success.googleLoginSuccess'));
      navigate('/'); // ✅ Redirect to dashboard
    } catch (error) {
      toast.error(t('toasts.errors.googleLoginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#121212',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1E1E1E',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>{t('signIn.title')}</h2>
        <p style={{ fontSize: '14px', color: '#b3b3b3', marginBottom: '24px' }}>
          {t('signIn.subtitle')}
        </p>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>
              {t('signIn.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={t('signIn.emailPlaceholder')}
              style={{
                width: '100%',
                backgroundColor: '#e6efff',
                color: '#000',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                outline: 'none',
              }}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              disabled={isLoading}
            />
            {formik.touched.email && formik.errors.email && (
              <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label htmlFor="password" style={{ fontSize: '14px' }}>
                {t('signIn.password')}
              </label>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: '#4AA181' }}>
                {t('signIn.forgotPassword')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('signIn.passwordPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: '#e6efff',
                  color: '#000',
                  padding: '10px 40px 10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  outline: 'none',
                }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#444',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{formik.errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            style={{
              width: '100%',
              backgroundColor: '#2e7d6d',
              color: '#fff',
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={16} style={{ marginRight: '6px' }} /> {t('signIn.loading')}
              </span>
            ) : (
              t('signIn.submit')
            )}
          </button>
        </form>

        {/* Separator */}
        <div style={{ margin: '16px 0', textAlign: 'center', fontSize: '14px', color: '#888' }}>
          {t('signIn.divider')}
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            border: '1px solid #666',
            backgroundColor: '#000',
            color: '#fff',
            padding: '10px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ width: '16px', height: '16px' }}
          />
          {isLoading ? t('signIn.pleaseWait') : t('signIn.googleButton')}
        </button>

        {/* Footer Link */}
        <p style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', color: '#888' }}>
          {t('signIn.noAccount')}{' '}
          <Link to="/register" style={{ color: '#4AA181' }}>
            {t('signIn.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;