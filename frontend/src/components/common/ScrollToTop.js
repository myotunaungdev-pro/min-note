import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Utility component that forces the window to scroll to the very top whenever the route path changes
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
