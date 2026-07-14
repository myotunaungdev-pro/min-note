import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} | PremiumNotes`;
        } else {
            document.title = 'PremiumNotes';
        }
    }, [title]);
};

export default usePageTitle;
