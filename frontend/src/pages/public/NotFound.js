import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import usePageTitle from '../../hooks/usePageTitle';
import PageTransition from '../../components/common/PageTransition';
import './NotFound.css';

const NotFound = () => {
    usePageTitle("404 Not Found");
    const { t } = useTranslation();

    return (
        <PageTransition>
            <div className="not-found-container">
                <div className="not-found-icon-wrapper">
                    <Ghost size={120} className="not-found-ghost" strokeWidth={1.5} />
                </div>
                <div className="w-full px-4 md:px-8 lg:max-w-5xl text-center flex flex-col items-center mx-auto">
                    <h1 className="not-found-title text-center">404</h1>
                    <h2 className="not-found-subtitle text-center">{t('notFound.subtitle')}</h2>
                    <p className="not-found-desc text-center leading-relaxed">
                        {t('notFound.description')}
                    </p>
                </div>
                <div className="w-full flex justify-center mt-6">
                    <Link to="/" className="not-found-btn">
                        <Home size={20} />
                        {t('notFound.returnHome')}
                    </Link>
                </div>
            </div>
        </PageTransition>
    );
};

export default NotFound;
