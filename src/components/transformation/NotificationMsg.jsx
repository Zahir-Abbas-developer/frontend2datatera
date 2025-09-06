import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const NotificationMsg = ({ closeToast, toastProps, file }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRadius: '5px',
        minWidth: '300px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '5px',
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', textAlign: 'left' }}>
            {t('notification.filename')}
          </div>
          <div style={{ textAlign: 'left', color: 'gray' }}>
            {file?.name || 'Untitled'}
          </div>
        </div>
      </div>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '1.5em',
          textAlign: 'center',
          marginBottom: '10px',
          color: 'green',
        }}
      >
        {t('notification.transformationStarted')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
        <div style={{ marginRight: '10px' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="lg" />
        </div>
        <div>{t('notification.working')}</div>
      </div>
    </div>
  );
};

export default NotificationMsg;