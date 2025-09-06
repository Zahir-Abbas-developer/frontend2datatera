import React, { useContext } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { ListContext } from '../../context/list';
import useWindowDimensions from '../../utiles/getWindowDimensions';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';

export const Header = ({ showDemo = false }) => {
  const { openSideBar, setOpenSideBar } = useContext(ListContext);
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const shouldShow = width <= 722 || showDemo;
  return (
    <>
      {shouldShow && (
        <div
          className={`${style.header} ${
            width > 722 && showDemo ? style.justifyEnd : ''
          }`}
        >
          {width <= 722 ? (
            <AiOutlineMenu
              className={style.menuIcon}
              onClick={() => setOpenSideBar(!openSideBar)}
            />
          ) : null}
          {false && showDemo && (
            <div className="d-flex justify-content-end absolute demo-button-wrapper justify-self-end">
              <button
                onClick={() => {
                  window.Storylane.Play({
                    type: 'popup',
                    demo_type: 'image',
                    width: 1899,
                    height: 1301,
                    scale: '0.95',
                    demo_url: 'https://app.storylane.io/demo/iadfs37z09g4',
                    padding_bottom: 'calc(68.51% + 27px)',
                  });
                }}
                className="sl-preview-cta"
                style={{
                  backgroundColor: '#9939EB',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0px 0px 15px rgba(26, 19, 72, 0.45)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'inline-block',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  height: '40px',
                  lineHeight: '1.2',
                  padding: '0 clamp(15px, 1.776vw, 20px)',
                  textOverflow: 'ellipsis',
                  transform: 'translateZ(0)',
                  transition: 'background 0.4s',
                  whiteSpace: 'nowrap',
                  width: 'auto',
                  zIndex: '99',
                  marginRight:'100px'
                }}
              >
             {t('demo.view')}
                <div
                  className="sl-preview-cta-ripple"
                  style={{
                    position: 'absolute',
                    border: '1px solid #9939EB',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    className="sl-preview-cta-ripple-shadow"
                    style={{
                      boxShadow: '#9939EB 0px 0px 4px 4px',
                      opacity: 0,
                      borderRadius: 'inherit',
                      position: 'absolute',
                      inset: 0,
                    }}
                  ></div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
