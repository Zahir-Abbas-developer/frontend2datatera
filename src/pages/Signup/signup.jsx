import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../config/firebaseConfig';
import api from '../../api/index';
import { AuthContext } from '../../context/auth';
import Hotjar from '@hotjar/browser';
import { useTranslation } from 'react-i18next';

const Signup = () => {
  const { t } = useTranslation();
  const { loginSuccess } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termRead, setTermRead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '', passwordConfirm: '' },
    validationSchema: yup.object({
      email: yup.string()
        .email(t('signUp.validation.emailInvalid'))
        .required(t('signUp.validation.emailRequired')),
      password: yup.string()
        .required(t('signUp.validation.passwordRequired'))
        .matches(/^\S*$/, t('signUp.validation.passwordNoSpaces')),
      passwordConfirm: yup.string()
        .required(t('signUp.validation.passwordConfirmRequired'))
        .matches(/^\S*$/, t('signUp.validation.passwordNoSpaces')),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!termRead) {
          toast.warning(t('signUp.messages.acceptTerms'));
          return;
        }
        setIsLoading(true);

        if (values.password.length < 8) {
          toast.warning(t('signUp.messages.passwordLength'));
          return;
        }
        if (values.password !== values.passwordConfirm) {
          toast.warning(t('signUp.messages.passwordMismatch'));
          return;
        }

        await api.post('/user/register', values);
        toast.success(t('signUp.messages.verificationSent'));
        Hotjar.event('User sign up success, redirected to email validation page.');
        navigate('/');
        resetForm();
      } catch (err) {
        toast.error(err?.response?.data?.message || t('common.errors.signupError'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, provider);
      const data = {
        name: res?.user?.displayName,
        email: res?.user?.email,
        photo: res?.user?.photoURL,
        token: res?.user?.accessToken,
      };

      const response = await api.post('/user/googleSignin', data);
      loginSuccess(response.data.token, response.data.data.user);
      Hotjar.event('User login success');
      toast.success(t('signUp.googleSuccess'));
      navigate('/');
    } catch {
      toast.error(t('common.errors.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div  style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div className='sign-in-margin' style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#1E1E1E',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
          {t('signUp.title')}
        </h2>
        <p style={{ fontSize: '14px', color: '#b3b3b3', marginBottom: '24px' }}>
          {t('signUp.subtitle')}
        </p>

        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>
              {t('signUp.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={t('signUp.emailPlaceholder')}
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

          {/* Password */}
          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>
              {t('signUp.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                  placeholder={'Create Password'}
                style={{
                  width: '100%',
                  backgroundColor: '#e6efff',
                  color: '#000',
                  padding: '10px 40px 10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  outline: 'none',
                }}
                onChange={(e) => formik.setFieldValue('password', e.target.value.trim())}
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
              <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="passwordConfirm" style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>
              {t('signUp.passwordConfirm')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('signUp.passwordConfirmPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: '#e6efff',
                  color: '#000',
                  padding: '10px 40px 10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  outline: 'none',
                }}
                onChange={(e) => formik.setFieldValue('passwordConfirm', e.target.value.trim())}
                onBlur={formik.handleBlur}
                value={formik.values.passwordConfirm}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.touched.passwordConfirm && formik.errors.passwordConfirm && (
              <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>
                {formik.errors.passwordConfirm}
              </p>
            )}
          </div>

          {/* Terms */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={termRead}
              onChange={() => setTermRead(!termRead)}
              style={{ accentColor: '#4AA181', width: '16px', height: '16px' }}
            />
            <label htmlFor="terms" style={{ fontSize: '14px', color: 'white' }}>
              {t('signUp.termsText')}{' '}
              <a href="https://aiagentlbs.com/terms-of-service/" target="_blank" rel="noreferrer" style={{ color: '#4AA181' }}>
                {t('signUp.termsLink')}
              </a>{' '}
              {t('signUp.andText')}{' '}
              <a href="https://aiagentlbs.com/privacy-policy/" target="_blank" rel="noreferrer" style={{ color: '#4AA181' }}>
                {t('signUp.privacyLink')}
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !termRead}
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
                <Loader2 className="animate-spin" size={16} style={{ marginRight: '6px' }} /> {t('signUp.creatingAccount')}
              </span>
            ) : (
              t('signUp.submit')
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ margin: '16px 0', textAlign: 'center', fontSize: '14px', color: '#888' }}>
          {t('signUp.orContinue')}
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignup}
          disabled={isLoading || !termRead}
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
          {t('signUp.googleButton')}
        </button>

        {/* Footer */}
        <p style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', color: '#888' }}>
          {t('signUp.haveAccount')}{' '}
          <Link to="/signin" style={{ color: '#4AA181' }}>
            {t('signUp.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
