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

const Header = ({ onSelectAll }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { searchQuery, sortBy, statusFilter, activeView } = useSelector((state) => state.notes);

    const selectedNoteIds = useSelector(state => state.notes.selectedNoteIds);

    const isSelectionMode = selectedNoteIds.length > 0;

    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const sortDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

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
                return t("notes.header.archived");
            case 'trash':
                return t("notes.sidebar.trash");
            default:
                return t("notes.sidebar.allNotes");
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
                        <button className="action-btn archive-btn" onClick={() => dispatch(bulkArchiveOnServer(selectedNoteIds))}>
                            <i className="bi bi-archive"></i>
                        </button>
                    )}

                    <button
                        className={`action-btn trash-btn ${activeView === 'trash' ? 'permanent-delete' : ''}`}
                        onClick={handleTrashOrDelete}
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
        <header
            className={`app-header ${isScrolled ? 'scrolled' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <div className="header-left">
                <button className="mobile-menu-btn w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90" onClick={() => dispatch(toggleSidebar())} data-tooltip-id="global-tooltip" data-tooltip-content={t("notes.toggleSidebarCtrl")}>
                    <i className="bi bi-list text-3xl"></i>
                </button>

                <h1 className="page-title">{getViewTitle()}</h1>
            </div>

            <div className="header-center">
                <div className="search-container">
                    <i className="bi bi-search search-icon"></i>
                    <input
                        id="global-search-input"
                        type="text"
                        className="search-input"
                        placeholder={t("notes.sidebar.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => dispatch(setSearchQuery(''))}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    )}
                </div>
            </div>

            <div className="header-right">
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

                <div className="dropdown mobile-only" ref={mobileMenuRef}>
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

                {activeView === 'all' && (
                    <button className="new-note-btn" onClick={handleNewNote} data-tooltip-id="global-tooltip" data-tooltip-content={t("notes.newNoteCtrlN")}>
                        <i className="bi bi-plus-lg"></i>
                        <span>{t("notes.sidebar.newNote")}</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;