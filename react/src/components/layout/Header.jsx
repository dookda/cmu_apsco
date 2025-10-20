import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = () => {
    const { language, toggleLanguage, t } = useLanguage();

    const handleSidebarToggle = (e) => {
        e.preventDefault();
        const sidebar = document.querySelector('.pc-sidebar');
        const container = document.querySelector('.pc-container');
        const header = document.querySelector('.pc-header');

        if (sidebar) {
            sidebar.classList.toggle('pc-sidebar-hide');
        }
        if (container) {
            container.classList.toggle('pc-sidebar-hide');
        }
        if (header) {
            header.classList.toggle('pc-sidebar-hide');
        }
    };

    const handleMobileSidebarToggle = (e) => {
        e.preventDefault();
        const sidebar = document.querySelector('.pc-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mob-sidebar-active');
        }
    };

    return (
        <header className="pc-header">
            <div className="header-wrapper">
                {/* [Mobile Media Block] start */}
                <div className="me-auto pc-mob-drp">
                    <ul className="list-unstyled">
                        {/* ======= Menu collapse Icon ===== */}
                        <li className="pc-h-item pc-sidebar-collapse">
                            <a href="#" className="pc-head-link ms-0" id="sidebar-hide" onClick={handleSidebarToggle}>
                                <i className="ti ti-menu-2"></i>
                            </a>
                        </li>
                        <li className="pc-h-item pc-sidebar-popup">
                            <a href="#" className="pc-head-link ms-0" id="mobile-collapse" onClick={handleMobileSidebarToggle}>
                                <i className="ti ti-menu-2"></i>
                            </a>
                        </li>
                        <li className="dropdown pc-h-item d-inline-flex d-md-none">
                            <a className="pc-head-link dropdown-toggle arrow-none m-0" data-bs-toggle="dropdown" href="#" role="button"
                                aria-haspopup="false" aria-expanded="false">
                                <i className="ph-duotone ph-magnifying-glass"></i>
                            </a>
                            <div className="dropdown-menu pc-h-dropdown drp-search">
                                <form className="px-3">
                                    <div className="mb-0 d-flex align-items-center">
                                        <input type="search" className="form-control border-0 shadow-none" placeholder={t('search')} />
                                        <button className="btn btn-light-secondary btn-search">{t('search').replace('...', '')}</button>
                                    </div>
                                </form>
                            </div>
                        </li>
                        <li className="pc-h-item d-none d-md-inline-flex">
                            <form className="form-search">
                                <i className="ph-duotone ph-magnifying-glass icon-search"></i>
                                <input type="search" className="form-control" placeholder={t('search')} />
                                <button className="btn btn-search" style={{ padding: 0 }}><kbd>ctrl+k</kbd></button>
                            </form>
                        </li>
                    </ul>
                </div>
                {/* [Mobile Media Block end] */}
                <div className="ms-auto">
                    <ul className="list-unstyled">
                        {/* Language Switcher */}
                        <li className="pc-h-item">
                            <a
                                href="#!"
                                className="pc-head-link me-0"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleLanguage();
                                }}
                                title={language === 'en' ? 'Switch to Thai' : 'เปลี่ยนเป็นภาษาอังกฤษ'}
                            >
                                <i className="ph-duotone ph-translate"></i>
                                <span className="ms-1 d-none d-md-inline-block fw-bold">
                                    {language === 'en' ? 'TH' : 'EN'}
                                </span>
                            </a>
                        </li>

                        <li className="dropdown pc-h-item">
                            <a className="pc-head-link dropdown-toggle arrow-none me-0" data-bs-toggle="dropdown" href="#" role="button"
                                aria-haspopup="false" aria-expanded="false">
                                <i className="ph-duotone ph-sun-dim"></i>
                            </a>
                            <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
                                <a href="#!" className="dropdown-item" onClick={() => window.layout_change('dark')}>
                                    <i className="ph-duotone ph-moon"></i>
                                    <span>{t('dark')}</span>
                                </a>
                                <a href="#!" className="dropdown-item" onClick={() => window.layout_change('light')}>
                                    <i className="ph-duotone ph-sun-dim"></i>
                                    <span>{t('light')}</span>
                                </a>
                                <a href="#!" className="dropdown-item" onClick={() => window.layout_change_default()}>
                                    <i className="ph-duotone ph-cpu"></i>
                                    <span>{t('default')}</span>
                                </a>
                            </div>
                        </li>

                        <li className="dropdown pc-h-item">
                            <a className="pc-head-link dropdown-toggle arrow-none me-0" data-bs-toggle="dropdown" href="#" role="button"
                                aria-haspopup="false" aria-expanded="false">
                                <i className="ph-duotone ph-bell"></i>
                                <span className="badge bg-success pc-h-badge">3</span>
                            </a>
                            <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-info"></i>
                                    <span>{t('systemStatusUpdate')}</span>
                                </a>
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-database"></i>
                                    <span>{t('databaseConnection')}</span>
                                </a>
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-chart-line"></i>
                                    <span>{t('newDataAvailable')}</span>
                                </a>
                            </div>
                        </li>

                        <li className="dropdown pc-h-item header-user-profile">
                            <a className="pc-head-link dropdown-toggle arrow-none me-0" data-bs-toggle="dropdown" href="#" role="button"
                                aria-haspopup="false" data-bs-auto-close="outside" aria-expanded="false">
                                <img src="/assets/images/user/avatar-2.jpg" alt="user-image" className="user-avtar" />
                            </a>
                            <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-user"></i>
                                    <span>{t('myAccount')}</span>
                                </a>
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-gear"></i>
                                    <span>{t('settings')}</span>
                                </a>
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-lifebuoy"></i>
                                    <span>{t('support')}</span>
                                </a>
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-lock-key"></i>
                                    <span>{t('lockScreen')}</span>
                                </a>
                                <a href="#!" className="dropdown-item">
                                    <i className="ph-duotone ph-power"></i>
                                    <span>{t('logout')}</span>
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;