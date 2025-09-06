import React, { useState, useEffect, useContext } from 'react';

const ListContext = React.createContext({});
const ListConsumer = ListContext.Consumer;

const ListProvider = ({ children }) => {
  const [list, setList] = useState(null);
  const [fetchConversions, setFetchConversions] = useState(false);

  // Retrieve the sidebar state from localStorage or set it to false by default
  const [openSideBar, setOpenSideBar] = useState(() => {
    return JSON.parse(localStorage.getItem('openSideBar')) || false;
  });
  // Effect to update localStorage whenever openSideBar changes
  useEffect(() => {
    localStorage.setItem('openSideBar', JSON.stringify(openSideBar));
  }, [openSideBar]);

  const setListItems = (item) => {
    localStorage.setItem('currentConverstion', JSON.stringify(item));
    setList(item);
  };

  useEffect(() => {
    let currCons = JSON.parse(localStorage.getItem('currentConverstion'));
    if (currCons) {
      setList(currCons);
    }
  }, []);

  return (
    <ListContext.Provider
      value={{
        setListItems,
        list,
        openSideBar,
        setOpenSideBar,
        fetchConversions,
        setFetchConversions,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export { ListContext, ListConsumer, ListProvider };
