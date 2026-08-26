'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    setSearchQuery,
    setSortBy,
    setStatusFilter,
    setModalOpen,
    setEditingNote,
    toggleSidebar,
    clearSelection,
} from '../store/notesSlice';
import { bulkArchiveOnServer, bulkTrashOnServer, bulkRestoreOnServer, permanentlyDeleteFromServer } from '../store/notesThunks';
import './Header.css';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ onSelectAll }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { searchQuery, sortBy, statusFilter, activeView, sidebarCollapsed } = useSelector((state) => state.notes);

    const selectedNoteIds = useSelector(state => state.notes.selectedNoteIds);

    const isSelectionMode = selectedNoteIds.length > 0;

    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const searchInputRef = useRef(null);
    const desktopSearchInputRef = useRef(null);

    const sortDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);

    const mobileMenuRef = useRef(null);
    const isDragging = useRef(false);

    useEffect(() => {
        const handleScroll = (event) => {
            const scrollTop = event.target.scrollTop || window.scrollY;

            if (scrollTop > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll, true);

        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isSortOpen || isStatusOpen || isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSortOpen, isStatusOpen, isMobileMenuOpen]);

    const handleTrashOrDelete = React.useCallback(() => {
        if (activeView === 'trash') {
            setIsConfirmDeleteOpen(true);
        } else {
            dispatch(bulkTrashOnServer(selectedNoteIds));
        }
    }, [activeView, dispatch, selectedNoteIds]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' && selectedNoteIds.length > 0) {
                const activeTag = document.activeElement.tagName;
                if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement.isContentEditable) {
                    return;
                }
                e.preventDefault();
                handleTrashOrDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNoteIds, handleTrashOrDelete]);

    useEffect(() => {
        const handleSearchShortcut = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (window.innerWidth >= 1280) {
                    desktopSearchInputRef.current?.focus();
                } else {
                    setIsSearchModalOpen(true);
                }
            }
            if (e.key === 'Escape') {
                setIsSearchModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleSearchShortcut);
        return () => window.removeEventListener('keydown', handleSearchShortcut);
    }, []);

    useEffect(() => {
        if (isSearchModalOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 100);
        }
    }, [isSearchModalOpen]);

    const handleSortSelect = (value) => {
        dispatch(setSortBy(value));
        setIsSortOpen(false);
    };

    const handleStatusSelect = (value) => {
        dispatch(setStatusFilter(value));
        setIsStatusOpen(false);
    };

    const handleNewNote = () => {
        dispatch(setEditingNote(null));
        dispatch(setModalOpen(true));
    };

    const getViewTitle = () => {
        switch (activeView) {
            case 'archive':
                return t("notes.navbar.archive");
            case 'trash':
                return t("notes.navbar.trash");
            default:
                return t("notes.navbar.allNotes");
        }
    };



    const confirmPermanentDelete = () => {
        selectedNoteIds.forEach(id => {
            dispatch(permanentlyDeleteFromServer(id));
        });
        dispatch(clearSelection());
        setIsConfirmDeleteOpen(false);
    };

    if (isSelectionMode) {
        return (
            <header
                className="app-header selection-mode"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <div className="header-left">
                    <button className="clear-selection-btn" onClick={() => dispatch(clearSelection())}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <span className="selection-count">{selectedNoteIds.length} {t("notes.header.selected")}</span>
                </div>

                <div className="header-right selection-actions">
                    {(activeView === 'archive' || activeView === 'trash') && (
                        <button
                            className="action-btn restore-btn"
                            onClick={() => dispatch(bulkRestoreOnServer(selectedNoteIds))}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7v6h6" />
                                <path d="M21 17a9 9 0 0 0-9-15 9 9 0 0 0-6 2.3L3 13" />
                            </svg>
                        </button>
                    )}

                    {activeView !== 'archive' && (
                        <button
                            className="action-btn archive-btn"
                            onClick={() => dispatch(bulkArchiveOnServer(selectedNoteIds))}
                        >
                            <i className="bi bi-archive"></i>
                        </button>
                    )}

                    <button
                        className={`action-btn trash-btn ${activeView === 'trash' ? 'permanent-delete' : ''}`}
                        onClick={() => handleTrashOrDelete()}
                    >
                        {activeView === 'trash' ? (
                            <i className="bi bi-trash-fill" style={{ color: '#ef4444' }}></i>
                        ) : (
                            <i className="bi bi-trash"></i>
                        )}
                    </button>
                </div>

                {isConfirmDeleteOpen && (
                    <div className="logout-modal-overlay">
                        <div className="logout-modal">
                            <div className="logout-modal-icon">
                                <i className="bi bi-exclamation-triangle"></i>
                            </div>
                            <h3>{selectedNoteIds.length === 1 ? t("notes.header.deleteConfirmTitleSingle") : t("notes.header.deleteConfirmTitleMulti")}</h3>
                            <p>{selectedNoteIds.length === 1 ? t("notes.header.deleteConfirmDescSingle") : t("notes.header.deleteConfirmDescMulti")}</p>
                            <div className="logout-modal-actions">
                                <button className="btn-modal-cancel" onClick={() => setIsConfirmDeleteOpen(false)}>
                                    {t("common.cancel")}
                                </button>
                                <button className="btn-modal-confirm" onClick={confirmPermanentDelete} data-tooltip-id="global-tooltip" data-tooltip-content={t("common.confirmEnter")}>
                                    {t("common.delete")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        );
    };

    return (
        <>
            {/* Drag constraints removed to prevent framer-motion centering bug */}
            <header
                className={`app-header relative ${isScrolled ? 'scrolled' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="header-left gap-3 flex-1 min-w-0">
                    <button
                        className="w-11 h-11 rounded-xl bg-gray-800/80 border border-gray-700/50 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 active:scale-95 min-[905px]:hidden flex-shrink-0"
                        onClick={() => dispatch(toggleSidebar())}
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content={t("notes.toggleSidebarCtrl")}
                    >
                        <Menu size={24} />
                    </button>

                    <h1 className="page-title flex-1 truncate">{getViewTitle()}</h1>
                </div>

                <div className="header-center hidden xl:flex">
                    <div className="group search-container flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl w-full min-w-[240px] hover:bg-white/10 focus-within:bg-white/10 transition-colors">
                        <div className="flex items-center text-slate-400 gap-3 overflow-hidden w-full">
                            <i className="bi bi-search flex-shrink-0"></i>
                            <input
                                ref={desktopSearchInputRef}
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-slate-400 w-full"
                                placeholder={t("notes.sidebar.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {searchQuery && (
                                <button
                                    className="text-slate-400 hover:text-white transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(setSearchQuery(''));
                                        desktopSearchInputRef.current?.focus();
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                            {!searchQuery && (
                                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md shadow-sm select-none transition-opacity group-focus-within:hidden">
                                    Ctrl K
                                </kbd>
                            )}
                        </div>
                    </div>
                </div>

                <div className="header-right flex items-center gap-2 sm:gap-4">
                    <button
                        className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700/50 flex xl:hidden items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 active:scale-95 flex-shrink-0 order-last md:order-none"
                        onClick={() => setIsSearchModalOpen(true)}
                    >
                        <i className="bi bi-search"></i>
                    </button>
                    <button
                        className="select-all-btn desktop-only"
                        onClick={onSelectAll}
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content={t("notes.selectAllVisibleCtrl")}
                    >
                        <i className="bi bi-check2-all"></i>
                    </button>
                    <div
                        className={`dropdown desktop-only ${isStatusOpen ? 'show' : ''}`}
                        ref={statusDropdownRef}
                    >
                        <button
                            className={`sort-dropdown dropdown-toggle ${isStatusOpen ? 'show' : ''}`}
                            type="button"
                            aria-expanded={isStatusOpen}
                            onClick={() => {
                                setIsStatusOpen((open) => !open);
                                setIsSortOpen(false);
                            }}
                        >
                            <i className="bi bi-filter"></i>
                            <span>
                                {statusFilter === 'all' && t("notes.all")}
                                {statusFilter === 'pending' && t("notes.card.pending")}
                                {statusFilter === 'done' && t("notes.card.done")}
                            </span>
                        </button>
                        <ul className={`dropdown-menu dropdown-menu-dark ${isStatusOpen ? 'show' : ''}`}>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => handleStatusSelect('all')}
                                >
                                    <i className="bi bi-infinity"></i> {t("notes.all")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${statusFilter === 'pending' ? 'active' : ''}`}
                                    onClick={() => handleStatusSelect('pending')}
                                >
                                    <i className="bi bi-circle"></i> {t("notes.card.pending")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${statusFilter === 'done' ? 'active' : ''}`}
                                    onClick={() => handleStatusSelect('done')}
                                >
                                    <i className="bi bi-check-circle"></i> {t("notes.card.done")}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div
                        className={`dropdown desktop-only ${isSortOpen ? 'show' : ''}`}
                        ref={sortDropdownRef}
                    >
                        <button
                            className={`sort-dropdown dropdown-toggle ${isSortOpen ? 'show' : ''}`}
                            type="button"
                            aria-expanded={isSortOpen}
                            onClick={() => {
                                setIsSortOpen((open) => !open);
                                setIsStatusOpen(false);
                            }}
                        >
                            <i className="bi bi-sort-down"></i>
                            <span>
                                {sortBy === 'latest' && t("notes.sidebar.sortLatest")}
                                {sortBy === 'a-z' && t("notes.sidebar.sortAZ")}
                                {sortBy === 'done' && t("notes.card.doneFirst")}
                                {sortBy === 'not-done' && t("notes.card.pendingFirst")}
                            </span>
                        </button>
                        <ul className={`dropdown-menu dropdown-menu-dark ${isSortOpen ? 'show' : ''}`}>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'latest' ? 'active' : ''}`}
                                    onClick={() => handleSortSelect('latest')}
                                >
                                    <i className="bi bi-clock"></i> {t("notes.sidebar.sortLatestFirst")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'a-z' ? 'active' : ''}`}
                                    onClick={() => handleSortSelect('a-z')}
                                >
                                    <i className="bi bi-sort-alpha-down"></i> {t("notes.sidebar.sortAZ")}
                                </button>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'done' ? 'active' : ''}`}
                                    onClick={() => handleSortSelect('done')}
                                >
                                    <i className="bi bi-check-circle"></i> {t("notes.card.doneFirst")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'not-done' ? 'active' : ''}`}
                                    onClick={() => handleSortSelect('not-done')}
                                >
                                    <i className="bi bi-circle"></i> {t("notes.card.pendingFirst")}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="dropdown mobile-only order-first md:order-none" ref={mobileMenuRef}>
                        <button
                            className="mobile-menu-btn transition-all duration-200 active:scale-90"
                            style={{ background: 'transparent', color: 'var(--text-color, #f8fafc)', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            type="button"
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => {
                                setIsMobileMenuOpen((open) => !open);
                            }}
                        >
                            <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg rotate-180 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bi-sliders rotate-0 text-gray-300'} hover:text-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] w-6 h-6 flex items-center justify-center transition-all duration-500 ease-out transform`} style={{ fontSize: '1.2rem' }}></i>
                        </button>
                        <ul className={`dropdown-menu dropdown-menu-dark ${isMobileMenuOpen ? 'show' : ''}`} style={{ right: 0, left: 'auto', minWidth: '200px' }}>
                            <li>
                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {
                                        onSelectAll();
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <i className="bi bi-check2-all"></i> {t("notes.selectAllVisibleCtrl")}
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" style={{ borderColor: 'rgba(255,255,255,0.1)' }} /></li>
                            <li className="dropdown-header" style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Filter</li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => { handleStatusSelect('all'); setIsMobileMenuOpen(false); }}
                                >
                                    <i className="bi bi-infinity"></i> {t("notes.all")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${statusFilter === 'pending' ? 'active' : ''}`}
                                    onClick={() => { handleStatusSelect('pending'); setIsMobileMenuOpen(false); }}
                                >
                                    <i className="bi bi-circle"></i> {t("notes.card.pending")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${statusFilter === 'done' ? 'active' : ''}`}
                                    onClick={() => { handleStatusSelect('done'); setIsMobileMenuOpen(false); }}
                                >
                                    <i className="bi bi-check-circle"></i> {t("notes.card.done")}
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" style={{ borderColor: 'rgba(255,255,255,0.1)' }} /></li>
                            <li className="dropdown-header" style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sort</li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'latest' ? 'active' : ''}`}
                                    onClick={() => { handleSortSelect('latest'); setIsMobileMenuOpen(false); }}
                                >
                                    <i className="bi bi-clock"></i> {t("notes.sidebar.sortLatestFirst")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'a-z' ? 'active' : ''}`}
                                    onClick={() => { handleSortSelect('a-z'); setIsMobileMenuOpen(false); }}
                                >
                                    <i className="bi bi-sort-alpha-down"></i> {t("notes.sidebar.sortAZ")}
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" style={{ borderColor: 'rgba(255,255,255,0.1)' }} /></li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'done' ? 'active' : ''}`}
                                    onClick={() => { handleSortSelect('done'); setIsMobileMenuOpen(false); }}
                                >
                                    <i className="bi bi-check-circle"></i> {t("notes.card.doneFirst")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`dropdown-item ${sortBy === 'not-done' ? 'active' : ''}`}
                                    onClick={() => { handleSortSelect('not-done'); setIsMobileMenuOpen(false); }}
                                >
                                    <i className="bi bi-circle"></i> {t("notes.card.pendingFirst")}
                                </button>
                            </li>
                        </ul>
                    </div>



                    {activeView === 'all' && !sidebarCollapsed && (
                        <button className="new-note-btn hidden min-[905px]:flex" onClick={handleNewNote} data-tooltip-id="global-tooltip" data-tooltip-content={t("notes.newNoteCtrlN")}>
                            <i className="bi bi-plus-lg"></i>
                            <span>{t("notes.sidebar.newNote")}</span>
                        </button>
                    )}
                    {isSearchModalOpen && (
                        <>
                            {/* Transparent invisible click-catcher for the rest of the body to close search */}
                            <div className="fixed inset-0 z-40 xl:hidden" onClick={() => setIsSearchModalOpen(false)}></div>

                            {/* The Header-localized active search overlay */}
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0f19] px-4 md:px-8 shadow-xl xl:hidden">
                                <div className="relative z-50 w-full max-w-3xl flex items-center h-full">
                                    <button
                                        className="text-gray-400 hover:text-white transition-colors mr-4 flex-shrink-0"
                                        onClick={() => setIsSearchModalOpen(false)}
                                    >
                                        <i className="bi bi-arrow-left-short text-3xl"></i>
                                    </button>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 w-full h-full"
                                        placeholder={t("notes.sidebar.searchPlaceholder")}
                                        value={searchQuery}
                                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                    />
                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                        {searchQuery && (
                                            <button
                                                className="text-gray-400 hover:text-white transition-colors"
                                                onClick={() => dispatch(setSearchQuery(''))}
                                            >
                                                <i className="bi bi-x-circle-fill text-lg"></i>
                                            </button>
                                        )}
                                        <kbd
                                            className="hidden lg:inline-block px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800/50 hover:bg-gray-800 hover:text-white rounded-md transition-colors cursor-pointer select-none border border-transparent"
                                            onClick={() => setIsSearchModalOpen(false)}
                                        >
                                            ESC
                                        </kbd>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Mobile-Only Draggable FAB */}
            {activeView === 'all' && (
                <motion.button
                    drag
                    onDragStart={() => { isDragging.current = true; }}
                    onDragEnd={() => { setTimeout(() => { isDragging.current = false; }, 150); }}
                    dragConstraints={{
                        left: typeof window !== 'undefined' ? -window.innerWidth + 80 : -500,
                        right: 0,
                        top: typeof window !== 'undefined' ? -window.innerHeight + 80 : -800,
                        bottom: 0
                    }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    dragTransition={{ bounceStiffness: 120, bounceDamping: 20 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center pointer-events-auto ${sidebarCollapsed ? '' : 'min-[905px]:hidden'}`}
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}
                    onClick={(e) => {
                        if (isDragging.current) return;
                        handleNewNote();
                    }}
                >
                    <i className="bi bi-plus-lg text-2xl"></i>
                </motion.button>
            )}
        </>
    );
};

export default Header;