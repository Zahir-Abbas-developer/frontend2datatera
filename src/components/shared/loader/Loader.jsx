import React, { useContext } from 'react';
import { CircularProgress } from '@mui/material';
import styles from '../../shared/loader/Loader.module.css';
import { ListContext } from '../../../context/list';
import useWindowDimensions from '../../../utiles/getWindowDimensions';

function Loader() {
  
  const {
    openSideBar,
  } = useContext(ListContext);
  const { width } = useWindowDimensions();

  return (
    <div className={styles.spinner} style={{ width: '100%' }}>
      <div
        style={{
          backgroundColor: '#f1f1f5',
          borderRadius: '10px',
          width: 'fit-content',
          height: 'fit-content',
          padding: '10px',
          paddingBottom: '5px',
          marginLeft: !openSideBar && width > 722 ? '300px' : '0px'
        }}
      >
        <CircularProgress
          style={{
            color: '#4aa181',
          }}
        />
      </div>
    </div>
  );
}

export default Loader;
