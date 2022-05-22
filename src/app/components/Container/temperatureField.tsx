import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { urlToHttpOptions } from "url";
import { appStore } from "../../../store/AppStore";
import { ChartStoreConfig } from "../../../store/ChartStore";

type FooterRect = {
    width: number;
    height: number;
};

type Optional<T> = T | undefined | null;

type ChartMembers = {
    backgroundPositionX: number;
    patternImageWidth: number;
    fillPattern: Optional<CanvasPattern>;
};

type Line = {
    x: number;
    y: number;
};

export const TemperatureField = observer(() => {
    const footerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [footerRect, setFooterRect] = useState<FooterRect>({
        width: 0,
        height: 0,
    });
    const requestAnimationFrameRef = useRef<number>(0);
    const [deltaTime, setDeltaTime] = useState(0);
    const [chartMembers, setChartMembers] = useState<ChartMembers>({
        backgroundPositionX: 0,
        patternImageWidth: 0,
        fillPattern: null,
    });
    const [renderOK, setRenderOK] = useState(false);
    const config: ChartStoreConfig = appStore.chartStore.getOption();

    /**
     * 캔버스의 가로 축을 정확히 기온 배열의 최대값만큼 나눠 나란히 전개합니다.
     * @param days
     */
    const getLinePositionX = (days: number) => {
        const canvas = canvasRef.current!;
        const canvasWidth = canvas.width;

        const thothreshold = Math.floor(
            canvasWidth / config.temperatures.slice(0, 5).length
        );
        const x = thothreshold * days;

        return x;
    };

    /**
     * 캔버스의 세로 축을 정확히 50등분하여 나란히 전개합니다.
     * @param temperature
     */
    const getLinePositionY = (temperature: number) => {
        const canvas = canvasRef.current!;
        const maxTemperature = config.maxTemperature;
        const canvasHeight = canvas.height;
        const thothreshold = Math.floor(canvasHeight / maxTemperature);
        const y = Math.floor(thothreshold * (maxTemperature - temperature));

        return y;
    };

    /**
     * 기온 배열을 캔버스에 대한 벡터로 변환합니다.
     */
    const getLines = (temperatures: number[]): Array<Line> => {
        const lines = temperatures.map((temperature, day) => {
            return {
                x: getLinePositionX(day),
                y: getLinePositionY(temperature),
            };
        });

        return lines;
    };

    /**
     * 무한 스크롤링을 위한 캔버스 이미지 패턴을 생성합니다.
     */
    const drawChartPattern = (pattern: { valid: boolean; src: string }) => {
        return new Promise((resolve, reject) => {
            const img: HTMLImageElement = new Image();
            img.src = pattern.src;
            img.onload = (ev: Event) => {
                setChartMembers({
                    ...chartMembers,
                    patternImageWidth: img.width,
                });
                resolve(img);
            };
            img.onerror = (err) => {
                reject(err);
            };
        });
    };

    const drawLines = (temperatures: number[], dt: number) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d")!;
        const {
            strokeStyle,
            lineWidth,
            font,
            padding,
            textAlign,
            temperatureSymbol,
            lineCap,
            smooth,
            fillChart,
            fillStyle,
            pattern,
            textColor,
        } = config;

        // 화면을 모두 지웁니다.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 배경 이미지 스크롤링 구현
        setChartMembers({
            ...chartMembers,
            backgroundPositionX:
                (chartMembers.backgroundPositionX + 1) %
                chartMembers.patternImageWidth,
        });

        // 요일 별 기온을 백분율에 따라 라인화합니다.
        const originTemperatures = temperatures.slice(0, 5);
        let lines = getLines(originTemperatures);
        const minY = lines[0].y;
        const maxY = lines[lines.length - 1].y;

        const avgY = Math.floor((minY + maxY) / 4);

        lines = lines.map((line) => {
            return {
                x: line.x,
                y: line.y - avgY,
            };
        });

        ctx.save();
        ctx.beginPath();

        // 종횡비 보정
        const aspectRatio = canvas.width / canvas.height;

        // 이동 행렬을 통해 패딩 값을 설정합니다.
        // 이 값은 캔버스의 가로 길이를 10등분한 값입니다.
        ctx.setTransform(1, 0, 0, 1, canvas.width / padding, 0);

        // 안티 앨리어싱을 설정합니다.
        if (smooth) {
            ctx.translate(0.5, 0.5);
        }

        // 라인을 연결합니다.
        for (let i = 0; i < lines.length; i++) {
            const cur = lines[i];
            const prev = lines[i - 1];

            // 차트를 색으로 채우지 않으려면 선 이동 처리를 해야 합니다.
            if (!fillChart) {
                if (prev) {
                    ctx.moveTo(prev.x, prev.y);
                } else {
                    ctx.moveTo(cur.x, cur.y);
                }
            }

            // \u00B0는 각도 심볼입니다.
            const text = temperatures[i] + temperatureSymbol;
            const tw = ctx.measureText(text).width;
            const pad = tw;

            // 라인의 각종 속성을 설정합니다.
            ctx.lineWidth = lineWidth;
            ctx.lineCap = lineCap as CanvasLineCap;
            ctx.lineTo(cur.x, cur.y);

            // 라인을 긋습니다.
            ctx.stroke();

            // 폰트를 설정합니다.
            ctx.font = font;
            ctx.textAlign = textAlign;

            // tw는 텍스트의 폭이며 두 배를 하지 않을 경우, 첫 번째 텍스트의 폭이 축소됩니다.
            ctx.lineWidth = lineWidth / 2;
            ctx.strokeStyle = strokeStyle;
            ctx.strokeText(text, cur.x, cur.y - pad, tw * 2);
            ctx.fillStyle = textColor;
            ctx.fillText(text, cur.x, cur.y - pad, tw * 2);
        }

        // 마지막 라인을 찾습니다.
        let items = [...lines];
        const lastLine = items.pop();

        // 마지막 라인의 끝점으로부터 캔버스 하단까지 연결하여 도형을 완성합니다.
        if (fillChart) {
            const restore = ctx.getTransform();
            if (lastLine) {
                ctx.lineTo(lastLine.x, -lastLine.y);
                ctx.lineTo(lastLine.x, canvas.height);
                ctx.lineTo(0, canvas.height);
            }

            ctx.closePath();
            ctx.setTransform(restore);

            // 이 값이 활성화되어있으면 스크롤링 패턴을 사용하여 반복 루프 효과를 구현합니다.
            if (pattern.valid) {
                ctx.translate(chartMembers.backgroundPositionX, 0);
                ctx.fillStyle = chartMembers.fillPattern!;
            } else {
                ctx.fillStyle = fillStyle;
            }

            ctx.fill();
        }

        ctx.restore();
    };

    /**
     * 프레임 업데이트
     * @param dt
     */
    const renderFrame = (dt: number) => {
        setDeltaTime(dt);
        if (config.pattern.valid && !renderOK) {
            drawChartPattern(config.pattern).then((img) => {
                const ctx = canvasRef.current!.getContext("2d")!;
                chartMembers.fillPattern = ctx.createPattern(
                    img as CanvasImageSource,
                    "repeat"
                );
                if (chartMembers.fillPattern) setRenderOK(true);
            });
        }
        if (renderOK) {
            drawLines(config.temperatures, dt);
        }
        requestAnimationFrameRef.current =
            window.requestAnimationFrame(renderFrame);
    };

    /**
     * 캔버스의 크기를 지정합니다.
     */
    useEffect(() => {
        if (appStore.chartStore.isReady) {
            if (!footerRef.current) {
                return;
            }

            setFooterRect({
                width: footerRef.current.clientWidth,
                height: footerRef.current.clientHeight,
            });
        }
    }, [
        appStore.chartStore.isReady,
        renderOK,
        ,
        window.innerWidth + window.innerHeight,
        footerRef.current?.clientWidth,
        footerRef.current?.clientHeight,
    ]);

    /**
     * Mount
     */
    useEffect(() => {
        if (appStore.chartStore.isReady) {
            requestAnimationFrameRef.current =
                window.requestAnimationFrame(renderFrame);
            /**
             * Unmount
             */
            return () => {
                window.cancelAnimationFrame(requestAnimationFrameRef.current);
            };
        }
    }, [
        renderOK,
        appStore.chartStore.isReady,
        requestAnimationFrameRef.current,
    ]);

    return (
        <footer className="temperature-field" ref={footerRef}>
            <canvas
                ref={canvasRef}
                width={footerRect.width}
                height={footerRect.height}
            >
                HTML5 캔버스를 지원하지 않는 브라우저입니다.
            </canvas>
        </footer>
    );
});
