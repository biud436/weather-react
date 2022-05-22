import React from "react";
import { observer } from "mobx-react-lite";

export type CotnainerProps = { children: React.ReactNode[] };

export const ContainerWrapper = observer(({ children }: CotnainerProps) => {
    return (
        <div className="container">
            {children.map((child) => {
                return child;
            })}
        </div>
    );
});
