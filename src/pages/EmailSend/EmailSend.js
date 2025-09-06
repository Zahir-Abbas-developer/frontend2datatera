import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../EmailSend/EmailSend.module.css';
import logo from '../../assets/images/logo.jpg';
import success from '../../assets/images/tick.png';

function EmailSend() {
  const { t } = useTranslation();

  return (
    <div className={styles.signin_main}>
      <div className={styles.pic_div}>
        <a href="https://aiagentlbs.com/" target="_blank" rel="noopener noreferrer">
          <img src={logo} className={styles.logo} alt={t('emailSend.logoAlt')} />
        </a>
      </div>
      <div className={styles.signinUpper}>
        <div className={styles.signin}>
          <div className={styles.success_main}>
            <img src={success} className={styles.success} alt={t('emailSend.successAlt')} />
          </div>
          <h6 className={styles.login_heading}>{t('emailSend.heading')}</h6>
          <p className={styles.explore_future_heading}>
            {t('emailSend.message')}
          </p>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <div className="footer-item">
          {t('emailSend.footer.copyright')} &copy;{' '}
          <a href="https://aiagentlbs.com/" target="_blank" rel="noopener noreferrer">
            {t('emailSend.footer.companyName')}
          </a>
        </div>
        <div className="footer-item">
          <a href="https://aiagentlbs.com/terms-of-service/" target="_blank" rel="noopener noreferrer">
            {t('emailSend.footer.terms')}
          </a>
        </div>
        <div className="footer-item">
          <a href="https://aiagentlbs.com/privacy-policy/" target="_blank" rel="noopener noreferrer">
            {t('emailSend.footer.privacy')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default EmailSend;