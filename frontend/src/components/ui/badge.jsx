import React from "react";

export function Badge({ children, className = "" }) {
    return (
        <span className={`px-2 py-1 rounded-md text-xs font-semibold bg-purple-700 text-white ${className}`}>
            {children}
        </span>
    );
}
