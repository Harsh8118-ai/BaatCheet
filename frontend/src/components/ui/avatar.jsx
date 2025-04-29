import React from "react";

export function Avatar({ className, children }) {
    return <div className={`h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center ${className}`}>{children}</div>;
}

export function AvatarImage({ src, alt }) {
    return <img className="h-full w-full rounded-full object-cover" src={src} alt={alt || "Avatar"} />;
}

export function AvatarFallback({ children }) {
    return <div className="h-full w-full flex items-center justify-center text-white bg-gray-600 rounded-full">{children}</div>;
}
