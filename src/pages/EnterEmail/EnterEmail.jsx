import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import api from '../../api';
import { useTranslation } from 'react-i18next';

const EnterEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: yup.object({
      email: yup.string()
        .email(t('forgotPassword.validation.emailInvalid'))
        .required(t('forgotPassword.validation.emailRequired')),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        await api.post('/user/forgot-password', values);
        toast.success(t('forgotPassword.messages.resetLinkSent'));
        navigate('/signin');
        resetForm();
      } catch (error) {
        toast.error(error?.response?.data?.message || t('common.errors.generalError'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#1E1E1E',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
          {t('forgotPassword.title')}
        </h2>
        <p style={{ fontSize: '14px', color: '#b3b3b3', marginBottom: '24px' }}>
          {t('forgotPassword.subtitle')}
        </p>

        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>
              {t('forgotPassword.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={t('forgotPassword.emailPlaceholder')}
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
              <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#2e7d6d',
              color: '#fff',
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={16} style={{ marginRight: '6px' }} />
                {t('forgotPassword.sending')}
              </span>
            ) : (
              t('forgotPassword.submit')
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', color: '#888' }}>
          {t('forgotPassword.rememberPassword')}{' '}
          <Link to="/signin" style={{ color: '#4AA181' }}>
            {t('forgotPassword.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EnterEmail;
