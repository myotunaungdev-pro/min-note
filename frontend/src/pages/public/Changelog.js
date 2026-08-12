import usePageTitle from '../../hooks/usePageTitle';
import React from 'react';

const Changelog = () => {
    usePageTitle("Changelog");
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 sm:px-6 md:px-8 py-10 md:py-20">
            <h1 className="text-4xl md:text-5xl font-bold text-[#00d4aa] mb-5">Changelog</h1>
            <p className="text-lg text-gray-400 w-full max-w-2xl leading-relaxed px-2">
                We are currently building this page. Check back soon for exciting updates and new features!
            </p>
        </div>
    );
};

export default Changelog;
