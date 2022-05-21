import { observer } from "mobx-react-lite";
import { createRef, useEffect, useRef, useState } from "react";

export const WaterDrop = observer(({ fillRate }: { fillRate: number }) => {
    const [size, setSize] = useState(10);
    const [canvasUrl, setCanvasUrl] = useState("");
    const [renderOK, setRenderOK] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(50);
    const [canvasHeight, setCanvasHeight] = useState(25);
    const [renderFillRate, setRenderFillRate] = useState(fillRate * 0.01);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const drawShape = () => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        const w = size;

        ctx.save();

        ctx.globalCompositeOperation = "source-over";

        ctx.setTransform(1, 0, 0, 1, canvasWidth / 2, canvasHeight / 2);
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(0 - w, 0);

        ctx.lineTo(0, 0 - w);
        ctx.lineTo(0 + w, 0);
        ctx.arc(0, 0, w, 0, Math.PI);
        ctx.lineWidth = 4;
        ctx.closePath();

        ctx.strokeStyle = "#1F9FDE";
        ctx.stroke();

        ctx.restore();
    };

    const drawBackground = (fill: boolean, rate: number) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        const w = size;

        ctx.save();

        ctx.globalCompositeOperation = "destination-in";

        ctx.fillStyle = "blue";

        ctx.fillRect(
            0,
            Math.floor(canvasHeight * rate),
            canvasWidth,
            canvasHeight
        );
        ctx.fill();

        ctx.restore();

        ctx.globalCompositeOperation = "source-over";

        ctx.save();

        // 캔버스의 중심점을 중앙으로 옮깁니다.
        ctx.setTransform(1, 0, 0, 1, canvasWidth / 2, canvasHeight / 2);

        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(0 - w, 0);
        ctx.lineTo(0, 0 - (w - 2));
        ctx.lineTo(0 + w, 0);
        ctx.arc(0, 0, w, 0, Math.PI);
        ctx.lineWidth = 10;
        ctx.closePath();
        ctx.fillStyle = "#4798E6";
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "source-in";

        ctx.fillStyle = "#4798E6";

        ctx.fillRect(
            0,
            Math.floor(canvasHeight * rate),
            canvasWidth,
            canvasHeight
        );
        ctx.fill();

        ctx.restore();
    };

    useEffect(() => {
        const rate = renderFillRate;
        drawBackground(true, 1.0 - rate);
        drawShape();

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        setCanvasUrl(canvas.toDataURL());

        setRenderOK(true);
    }, [canvasRef]);

    return (
        <>
            {renderOK ? (
                <img
                    ref={imageRef}
                    src={canvasUrl}
                    className="fill-water-drop"
                    title={`습도 ${fillRate}%`}
                    width={50}
                    height={50}
                ></img>
            ) : (
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                ></canvas>
            )}
        </>
    );
});
