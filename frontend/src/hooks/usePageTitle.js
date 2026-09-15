import { useEffect } from 'react';
import { APP_NAME } from '../utils/constants';

// Custom hook to dynamically update the browser tab title as the user navigates the app
const usePageTitle = (title) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} | ${APP_NAME}`;
        } else {
            document.title = APP_NAME;
        }
    }, [title]);
};

export default usePageTitle;
