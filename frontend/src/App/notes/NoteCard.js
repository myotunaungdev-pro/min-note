'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setEditingNote,
    setModalOpen,
    setReadingNote,
    setReaderOpen,
    toggleSelectNote
} from '../store/notesSlice';
import { updateNoteOnServer } from '../store/notesThunks';
import './NoteCard.css';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

const NoteCard = ({ note, onDeleteRequest, onSelectToggle, cardStyle = 'default' }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { activeView } = useSelector((state) => state.notes);

    const isSelected = useSelector((state) => state.notes.selectedNoteIds.includes(note._id));
    const card3dRef = React.useRef(null);

    const handleMouseMove = (e) => {
        if (!card3dRef.current) return;
        const rect = card3dRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const MAX_TILT = 14;
        const rotY = ((x - cx) / cx) * MAX_TILT;
        const rotX = -((y - cy) / cy) * MAX_TILT;

        card3dRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(24px)`;
    };

    const handleMouseLeave = () => {
        if (!card3dRef.current) return;
        card3dRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Removed stripHtml, safely rendering HTML directly

    const handleReadNote = (e) => {
        if (e && e.target) {
            const a = e.target.closest('a');
            if (a && a.href) {
                e.preventDefault();
                e.stopPropagation();
                window.open(a.href, '_blank', 'noopener,noreferrer');
                return;
            }
        }
        dispatch(setReadingNote(note));
        dispatch(setReaderOpen(true));
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        dispatch(setReadingNote(null));
        dispatch(setReaderOpen(false));
        dispatch(setEditingNote(note));
        dispatch(setModalOpen(true));
    };

    // Archive (or) Unarchive (Toggle Logic)
    const handleArchiveToggle = (e) => {
        e.stopPropagation();
        dispatch(updateNoteOnServer({
            ...note,
            isArchived: !note.isArchived
        }));
    };

    // Soft Delete
    const handleDelete = (e) => {
        e.stopPropagation();
        dispatch(updateNoteOnServer({
            ...note,
            isDeleted: true,
            isArchived: false
        }));
    };

    // Restore
    const handleRestore = (e) => {
        e.stopPropagation();
        dispatch(updateNoteOnServer({
            ...note,
            isDeleted: false
        }));
    };

    // Done (or) Pending
    const handleToggleDone = (e) => {
        e.stopPropagation();
        dispatch(updateNoteOnServer({
            ...note,
            isDone: !note.isDone
        }));
    };

    // Permanent Delete
    const handlePermanentDeleteClick = (e) => {
        e.stopPropagation();
        if (onDeleteRequest) {
            onDeleteRequest(note);
        }
    };

    const getCardStyleClasses = () => {
        let classes = `note-card ${note.isDone ? 'done' : ''} ${isSelected ? 'selected' : ''} `;

        if (cardStyle === 'cyber') {
            classes += `bg-theme-${note.theme || 'default'}`;
        } else if (cardStyle === 'dynamic3d') {
            classes += `bg-theme-${note.theme || 'default'}`;
        } else {
            classes += `bg-theme-${note.theme || 'default'} theme-default`;
        }
        return classes;
    };

    const getCardInlineStyles = () => {
        return {};
    };

    if (cardStyle === 'dynamic3d') {
        const dynamicClasses = `note-card ${note.isDone ? 'done' : ''} ${isSelected ? 'selected' : ''}`;
        return (
            <div className="theme-dynamic3d">
                <div
                    className="scene"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => { if (e.shiftKey) e.preventDefault(); }}
                >
                    <div className="card3d" ref={card3dRef}>

                        <div className={dynamicClasses}>
                            <div className="note-card-glow"></div>
                            <div className="note-card-header"></div>
                            <div className="note-card-footer"></div>
                        </div>

                        <div className="depth-sidebar">
                            <span className="note-tag">
                                {t(`tags.${note.tag?.toLowerCase()}`, note.tag)}
                            </span>
                            <span className="note-date">
                                <i className="bi bi-calendar3"></i>
                                {formatDate(note.updatedAt || note.createdAt)}
                            </span>
                        </div>

                        <div className="note-main">
                            <div className="note-title-row">
                                <div className="note-checkbox-wrapper" onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectToggle) {
                                        onSelectToggle(e);
                                    } else {
                                        dispatch(toggleSelectNote(note._id));
                                    }
                                }}>
                                    <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                                        {isSelected && <i className="bi bi-check"></i>}
                                    </div>
                                </div>
                                <h3 className={`note-title ${note.titleFontFamily ? `ql-font-${note.titleFontFamily}` : ''}`}>{note.title}</h3>
                            </div>

                            <div
                                className="note-card-body"
                                onClick={handleReadNote}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleReadNote();
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Read note: ${note.title}`}
                            >
                                <div className="note-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}></div>
                            </div>
                        </div>

                        <div className="note-status" onClick={(e) => e.stopPropagation()}>
                            <button
                                className={`status-btn ${note.isDone ? 'completed' : ''}`}
                                onClick={handleToggleDone}
                            >
                                <i className={`bi ${note.isDone ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                                <span>{note.isDone ? t("notes.card.done") : t("notes.card.pending")}</span>
                            </button>
                        </div>

                        <div className="note-actions" onClick={(e) => e.stopPropagation()}>
                            {activeView === 'trash' ? (
                                <>
                                    <button className="action-btn restore" onClick={handleRestore} title={t('notes.card.restore')}>
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                    </button>
                                    <button className="action-btn delete-permanent" onClick={handlePermanentDeleteClick} title={t('notes.card.permanentDelete')}>
                                        <i className="bi bi-trash-fill" style={{ color: '#ef4444' }}></i>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="action-btn edit" onClick={handleEdit} title={t('notes.card.edit')}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className={`action-btn ${note.isArchived ? 'unarchive' : 'archive'}`}
                                        onClick={handleArchiveToggle}
                                        title={note.isArchived ? t('notes.card.unarchive') : t('notes.card.archive')}
                                    >
                                        <i className={`bi ${note.isArchived ? 'bi-box-arrow-up' : 'bi-archive'}`}></i>
                                    </button>
                                    <button className="action-btn delete" onClick={handleDelete} title={t('notes.card.delete')}>
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    if (cardStyle === 'cyber') {
        const cyberClasses = `note-card ${note.isDone ? 'done' : ''} ${isSelected ? 'selected' : ''}`;
        return (
            <div className="theme-cyber">
                <div className="note-card-wrap" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => { if (e.shiftKey) e.preventDefault(); }}>
                    <div className={cyberClasses}>

                        <div className="note-spine">
                            <span className="note-date">
                                <i className="bi bi-calendar3"></i>
                                {formatDate(note.updatedAt || note.createdAt)}
                            </span>
                        </div>

                        <div className="note-main">

                            <span className="note-tag" style={note.tagColor ? { background: `linear-gradient(135deg, ${note.tagColor}, ${note.tagColor}CC)` } : {}}>
                                {t(`tags.${note.tag?.toLowerCase()}`, note.tag)}
                            </span>

                            <div className="note-title-row">
                                <div className="note-checkbox-wrapper" onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectToggle) {
                                        onSelectToggle(e);
                                    } else {
                                        dispatch(toggleSelectNote(note._id));
                                    }
                                }}>
                                    <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                                        {isSelected && <i className="bi bi-check"></i>}
                                    </div>
                                </div>
                                <h3 className={`note-title ${note.titleFontFamily ? `ql-font-${note.titleFontFamily}` : ''}`}>{note.title}</h3>
                            </div>

                            <div
                                className="note-card-body"
                                onClick={handleReadNote}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleReadNote();
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Read note: ${note.title}`}
                            >
                                <div className="note-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}></div>
                            </div>

                            <div className="note-card-footer">
                                <div className="note-status" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className={`status-btn ${note.isDone ? 'completed' : ''}`}
                                        onClick={handleToggleDone}
                                    >
                                        <i className={`bi ${note.isDone ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                                        <span>{note.isDone ? t("notes.card.done") : t("notes.card.pending")}</span>
                                    </button>
                                </div>

                                <div className="note-actions" onClick={(e) => e.stopPropagation()}>
                                    {activeView === 'trash' ? (
                                        <>
                                            <button className="action-btn restore" onClick={handleRestore} title={t('notes.card.restore')}>
                                                <i className="bi bi-arrow-counterclockwise"></i>
                                            </button>
                                            <button className="action-btn delete-permanent" onClick={handlePermanentDeleteClick} title={t('notes.card.permanentDelete')}>
                                                <i className="bi bi-trash-fill" style={{ color: '#ef4444' }}></i>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="action-btn edit" onClick={handleEdit} title={t('notes.card.edit')}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className={`action-btn ${note.isArchived ? 'unarchive' : 'archive'}`}
                                                onClick={handleArchiveToggle}
                                                title={note.isArchived ? t('notes.card.unarchive') : t('notes.card.archive')}
                                            >
                                                <i className={`bi ${note.isArchived ? 'bi-box-arrow-up' : 'bi-archive'}`}></i>
                                            </button>
                                            <button className="action-btn delete" onClick={handleDelete} title={t('notes.card.delete')}>
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={getCardStyleClasses()}
            style={getCardInlineStyles()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
                if (e.shiftKey) e.preventDefault();
            }}
        >

            <div className={`${isSelected ? 'note-checkbox-wrapper-selected' : 'note-checkbox-wrapper'}`} onClick={(e) => {
                e.stopPropagation();
                if (onSelectToggle) {
                    onSelectToggle(e);
                } else {
                    dispatch(toggleSelectNote(note._id));
                }
            }}>
                <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <i className="bi bi-check"></i>}
                </div>
            </div>

            {cardStyle === 'default' && (
                <div className="note-card-glow" style={{ backgroundColor: note.tagColor }}></div>
            )}

            <div className="note-card-header">
                <span className="note-tag" style={{ backgroundColor: `${note.tagColor}20`, color: note.tagColor }}>
                    {t(`tags.${note.tag?.toLowerCase()}`, note.tag)}
                </span>
                <span className="note-date">
                    <i className="bi bi-calendar3"></i>
                    {formatDate(note.updatedAt || note.createdAt)}
                </span>
            </div>

            <div
                className="note-card-body relative overflow-hidden flex-1 [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
                onClick={handleReadNote}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleReadNote();
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Read note: ${note.title}`}
            >
                <h3 className={`note-title ${note.titleFontFamily ? `ql-font-${note.titleFontFamily}` : ''}`}>{note.title}</h3>
                <div className="note-content" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}></div>
            </div>

            <div className="note-card-footer" onClick={(e) => e.stopPropagation()}>
                <div className="note-status">
                    <button
                        className={`status-btn ${note.isDone ? 'completed' : ''}`}
                        onClick={handleToggleDone}
                    >
                        <i className={`bi ${note.isDone ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                        <span>{note.isDone ? t("notes.card.done") : t("notes.card.pending")}</span>
                    </button>
                </div>

                <div className="note-actions">
                    {activeView === 'trash' ? (
                        <>
                            <button className="action-btn restore" onClick={handleRestore}>
                                <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                            <button className="action-btn delete-permanent" onClick={handlePermanentDeleteClick}>
                                <i className="bi bi-trash-fill" style={{ color: '#ef4444' }}></i>
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="action-btn edit" onClick={handleEdit}>
                                <i className="bi bi-pencil"></i>
                            </button>

                            <button
                                className={`action-btn ${note.isArchived ? 'unarchive' : 'archive'}`}
                                onClick={handleArchiveToggle}
                            >
                                <i className={`bi ${note.isArchived ? 'bi-box-arrow-up' : 'bi-archive'}`}></i>
                            </button>

                            <button className="action-btn delete" onClick={handleDelete}>
                                <i className="bi bi-trash3"></i>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteCard;