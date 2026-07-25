import { useEffect } from 'react';
import { APP_NAME } from '../utils/constants';

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
