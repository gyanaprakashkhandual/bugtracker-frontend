"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RouteProgressBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [width, setWidth] = useState(0);
    const [opacity, setOpacity] = useState(1);
    const targetPathRef = useRef("");
    const animationRef = useRef(null);
    const originalPushRef = useRef(null);

    const start = useCallback(() => {
        setWidth(0);
        setOpacity(1);
        setIsNavigating(true);

        let currentWidth = 0;
        const stage1Duration = 300;
        const stage1Target = 10;
        const stage1Start = Date.now();

        const animateStage1 = () => {
            const elapsed = Date.now() - stage1Start;
            const progress = Math.min(elapsed / stage1Duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            currentWidth = eased * stage1Target;
            setWidth(currentWidth);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateStage1);
            } else {
                const stage2Start = Date.now();
                const stage2Duration = 3000;
                const stage2Target = 90;

                const animateStage2 = () => {
                    const elapsed = Date.now() - stage2Start;
                    const progress = Math.min(elapsed / stage2Duration, 1);
                    currentWidth = stage1Target + (stage2Target - stage1Target) * progress;
                    setWidth(currentWidth);

                    if (progress < 1 && isNavigating) {
                        animationRef.current = requestAnimationFrame(animateStage2);
                    }
                };

                animateStage2();
            }
        };

        animateStage1();
    }, [isNavigating]);

    const end = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const startWidth = width;
        const startTime = Date.now();
        const duration = 300;

        const animateFinish = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const newWidth = startWidth + (100 - startWidth) * progress;
            setWidth(newWidth);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateFinish);
            } else {
                const fadeStart = Date.now();
                const fadeDuration = 300;

                const animateFade = () => {
                    const elapsed = Date.now() - fadeStart;
                    const progress = Math.min(elapsed / fadeDuration, 1);
                    setOpacity(1 - progress);

                    if (progress < 1) {
                        animationRef.current = requestAnimationFrame(animateFade);
                    } else {
                        setIsNavigating(false);
                        setWidth(0);
                        setOpacity(1);
                    }
                };

                animateFade();
            }
        };

        animateFinish();
    }, [width]);

    useEffect(() => {
        originalPushRef.current = router.push;

        router.push = function (href, options) {
            let targetPath = href;
            if (typeof href === 'string' && href.startsWith('http')) {
                try {
                    const url = new URL(href);
                    targetPath = url.pathname;
                } catch (e) { }
            }

            if (targetPath !== window.location.pathname) {
                targetPathRef.current = targetPath;
                start();
            }

            return originalPushRef.current.call(this, href, options);
        };

        const handleClick = (e) => {
            const link = e.target.closest("a");
            if (link) {
                const href = link.getAttribute("href");
                if (href && href.startsWith("/") && href !== window.location.pathname) {
                    targetPathRef.current = href;
                    start();
                }
            }
        };

        document.addEventListener("click", handleClick, true);

        return () => {
            if (originalPushRef.current) {
                router.push = originalPushRef.current;
            }
            document.removeEventListener("click", handleClick, true);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [router, start]);

    useEffect(() => {
        if (isNavigating && pathname === targetPathRef.current) {
            end();
            targetPathRef.current = "";
        }
    }, [pathname, isNavigating, end]);

    if (!isNavigating && width === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 h-0.5 z-[9999] pointer-events-none"
            style={{ opacity }}
        >
            <div
                className="h-full bg-blue-600"
                style={{
                    width: `${width}%`,
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.7)",
                }}
            />
        </div>
    );
}