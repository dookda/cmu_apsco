import React from 'react';

const Breadcrumb = ({ title, items = [] }) => {
    return (
        <div className="page-header">
            <div className="page-block">
                <div className="row align-items-center">
                    <div className="col-md-12">
                        <ul className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/">Home</a>
                            </li>
                            {items.map((item, index) => (
                                <li key={index} className={`breadcrumb-item ${index === items.length - 1 ? '' : ''}`}>
                                    {item.link ? (
                                        <a href={item.link}>{item.name}</a>
                                    ) : (
                                        <span aria-current="page">{item.name}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-md-12">
                        <div className="page-header-title">
                            <h2 className="mb-0">{title}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;