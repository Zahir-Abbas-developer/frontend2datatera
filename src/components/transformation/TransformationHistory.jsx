import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  faCheck,
  faExclamationCircle,
  faInfoCircle,
  faTimes,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Table } from '../ui/table';

const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date
    return date.toLocaleString();
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
};

const TransformationHistory = ({ conversionHistory, isTransformationHistoryLoading }) => {
  const { t } = useTranslation();

  return (
    //color="#e0e0e0" highlightColor="#f5f5f5"
    <SkeletonTheme  enableAnimation="true">
      <>
        <Table>
          <thead className="table_heading sticky-header">
            <tr>
              <th style={{ width: '10vw' }}>{t('tableHeaders.jobId')}</th>
              <th style={{ width: '12vw', display: 'none' }}>{t('tableHeaders.files')}</th>
              <th style={{ width: '8vw' }}>{t('tableHeaders.configurations')}</th>
              <th style={{ width: '8vw' }}>{t('tableHeaders.status')}</th>
              <th style={{ width: '12vw' }}>{t('tableHeaders.started')}</th>
              <th style={{ width: '12vw' }}>{t('tableHeaders.ended')}</th>
              <th style={{ width: '15vw' }}>{t('tableHeaders.error')}</th>
            </tr>
          </thead>
          <tbody className="table_body">
            {isTransformationHistoryLoading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td><Skeleton /></td>
                  <td style={{ display: 'none' }}><Skeleton count={2} /></td>
                  <td><Skeleton count={3} /></td>
                  <td><Skeleton count={2} /></td>
                  <td><Skeleton /></td>
                  <td><Skeleton /></td>
                  <td><Skeleton /></td>
                </tr>
              ))
            ) : (
              conversionHistory?.length > 0 && conversionHistory.map((historyItem) => (
                <tr key={historyItem._id}>
                  <td>{historyItem._id || <Skeleton />}</td>
                  <td style={{ display: 'none' }}>
                    {historyItem.dataFile?.location || historyItem.sampleFile?.location ? (
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyleType: 'none',
                        }}
                      >
                        {historyItem.dataFile?.location ? (
                          <li>
                            Data: <a href={historyItem.dataFile.location}>{historyItem.source}</a>
                          </li>
                        ) : (
                          <li>Data: <span className="black-text">{historyItem.source || <Skeleton />}</span></li>
                        )}
                        {/* {historyItem.sampleFile?.location ? (
                          <li>
                            Sample: <a href={historyItem.sampleFile.location}>{historyItem.sampleFile?.originalName}</a>
                          </li>
                        ) : (
                          <li>Sample: <span className="black-text"><Skeleton /></span></li>
                        )} */}
                      </ul>
                    ) : <Skeleton />}
                  </td>
                  <td>
                    {historyItem.config ? (
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyleType: 'none',
                        }}
                      >
                        <li>{t('configLabels.processUrls')}: <b>{historyItem.config?.processUrls?.toString() || <Skeleton />}</b></li>
                        <li>{t('configLabels.merge')}: <b>{historyItem.config?.merge?.toString() || <Skeleton />}</b></li>
                        <li>{t('configLabels.pagination')}: <b>{historyItem.config?.Pagination?.toString() || <Skeleton />}</b></li>
                        <li>{t('configLabels.entireWebsite')}: <b>{historyItem.config?.entireWebsite?.toString() || <Skeleton />}</b></li>
                        <li>{t('configLabels.aiEnrichment')}: <b>{historyItem.config?.search?.toString() || <Skeleton />}</b></li>
                        {/* <li>AI Model: <b>{historyItem.config?.model?.toString() || <Skeleton />}</b></li> */}
                      </ul>
                    ) : <Skeleton />}
                  </td>
                  <td>
                    {historyItem.status ? (
                      <span className={`status-${historyItem.status.toLowerCase()}`}>
                        {historyItem.status === 'Done' ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} size="lg" />
                            &nbsp;&nbsp;
                            {historyItem.status.toUpperCase()} <br/>
                            {historyItem.number_of_rows && ` (Rows added: ${historyItem.number_of_rows})`}
                          </>
                        ) : historyItem.status === 'Error' ? (
                          <>
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                            &nbsp;&nbsp;
                            {historyItem.status.toUpperCase()}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                            &nbsp;&nbsp;
                            {historyItem.status.toUpperCase()}
                          </>
                        )}
                      </span>
                    ) : <Skeleton />}
                  </td>
                  <td>{historyItem.startTime ? formatDate(historyItem.startTime) : <Skeleton />}</td>
                  <td>{historyItem.endTime ? formatDate(historyItem.endTime) : <Skeleton />}</td>
                  <td>
                    {historyItem.errorMessage ? (
                      <>
                        <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: '5px', color: 'red' }} size="lg" />
                        <span style={{ color: 'red' }}>{historyItem.errorMessage}</span>
                      </>
                    ) : isTransformationHistoryLoading && <Skeleton />}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        {!isTransformationHistoryLoading && conversionHistory?.length === 0 && (
          <div style={{ textAlign: 'center', color: 'green', fontSize: '1.5em' }}>
            <FontAwesomeIcon icon={faInfoCircle} size="2x" />
            <p>{t('emptyState')}.</p>
          </div>
        )}
      </>
    </SkeletonTheme>
  );
};

export default TransformationHistory;
