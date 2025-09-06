import React, { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';

const PlansContext = React.createContext({});

const PlanProvider = ({ children }) => {
  const [userPlan, setUserPlan] = useState(null);
  const [deactivatedSub, setDeactivatedSub] = useState(null);
  const [search, setTotalSearches] = useState({
    remainingUploads: null,
    totalUploads: null,
  });

  const getToken = () => {
    // Fetch token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
    }
    return token;
  };

  const token = getToken();

  // Function to fetch total uploads
  const handleTotalUploads = () => {
    api
      .get(`/user/total-uploads`)
      .then((res) => {
        setTotalSearches(res?.data);
      })
      .catch((err) => {
        console.error('Error fetching total uploads:', err);
        toast(err?.response?.data?.message || 'Failed to fetch uploads', {
          type: 'error',
        });
      });
  };

  // Function to fetch user plan and subscriptions
  const getUserPlan = () => {
    api
      .get(`/user/me`)
      .then((res) => {
        const activeSubscription = res?.data?.subscriptions?.find(
          (sub) => sub.active === true && sub.status === true,
        );

        const additionalActiveData = res?.data?.allPlans?.find(
          (plan) => plan.active === true && plan.status === true,
        );

        const deactiveSubscription = res?.data?.subscriptions?.find(
          (sub) => sub.active === false && sub.status === true,
        );

        setDeactivatedSub(deactiveSubscription);
        setUserPlan([{ activeSubscription, ...additionalActiveData }]);
        handleTotalUploads();
      })
      .catch((err) => {
        console.error('Error fetching user plan:', err);
      });
  };

  // Function to validate the user's plan
  const handleValidatePlan = () => {
    api
      .post('/user/validate-plan')
      .then(() => {
        getUserPlan();
      })
      .catch((err) => {
        const errorMessage = err?.response?.data?.message;
        toast(errorMessage || 'Failed to validate plan', { type: 'error' });

        // Retry validation if the error is due to expiry
        if (errorMessage === 'you have reached the expiry date') {
          api
            .post('/user/validate-plan')
            .then(() => {
              getUserPlan();
            })
            .catch((retryErr) => {
              toast(
                retryErr?.response?.data?.message || 'Retry failed',
                { type: 'error' }
              );
            });
        }
      });
  };

  // Fetch and validate the user's plan on initial load if token exists
  useEffect(() => {
    if (token) {
      handleValidatePlan();
    }
  }, [token]);

  return (
    <PlansContext.Provider
      value={{ userPlan, search, handleValidatePlan, deactivatedSub }}
    >
      {children}
    </PlansContext.Provider>
  );
};

export { PlansContext, PlanProvider };
