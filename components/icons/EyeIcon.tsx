import React from 'react';

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        {...props}
    >
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.402a1.651 1.651 0 012.434-.88l1.173.882a1.651 1.651 0 001.996 0l1.173-.882a1.651 1.651 0 012.434.88l.88 1.402c.667.973.667 2.253 0 3.226l-.88 1.402a1.651 1.651 0 01-2.434.88l-1.173-.882a1.651 1.651 0 00-1.996 0l-1.173.882a1.651 1.651 0 01-2.434-.88l-.88-1.402a1.651 1.651 0 010-1.18zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
    </svg>
);