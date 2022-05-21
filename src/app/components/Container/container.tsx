import React from "react";

type CotnainerProps = { children: React.ReactNode[] };

export function ContainerWrapper({ children }: CotnainerProps) {
    return (
        <div className="container">
            {children.map((child) => {
                return <>{child}</>;
            })}
        </div>
    );
}
