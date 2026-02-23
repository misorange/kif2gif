"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { JKFPlayer } from "json-kifu-format";
import { createGifEncoder } from "@/lib/gif-encoder";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipBack, SkipForward, Share2, Image as ImageIcon } from "lucide-react";

interface ShogiBoardProps {
    player: JKFPlayer;
    onClose: () => void;
}

const PIECE_MAP: Record<string, string> = {
    FU: "歩", KY: "香", KE: "桂", GI: "銀", KI: "金", KA: "角", HI: "飛", OU: "玉",
    TO: "と", NY: "成香", NK: "成桂", NG: "成銀", UM: "馬", RY: "龍",
};

export default function ShogiBoard({ player, onClose }: ShogiBoardProps) {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [maxStep, setMaxStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        setMaxStep(player.getMaxTesuu());
        drawBoard(player);
    }, [player]);

    useEffect(() => {
        drawBoard(player);
    }, [currentStep, player]);

    const drawBoard = useCallback((currentPlayer: JKFPlayer) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Canvas settings
        const width = 640;
        const height = 640;
        const cellSize = 56;
        const offsetX = (width - cellSize * 9) / 2;
        const offsetY = (height - cellSize * 9) / 2;

        // Clear
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Draw Board wood color (aesthetic yellowish-brown, but we'll use a very mild color)
        ctx.fillStyle = "#fdfaf0";
        ctx.fillRect(offsetX, offsetY, cellSize * 9, cellSize * 9);

        // Draw Grid
        ctx.strokeStyle = "#3f3f46"; // zinc-700
        ctx.lineWidth = 1;

        for (let i = 0; i <= 9; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(offsetX + i * cellSize, offsetY);
            ctx.lineTo(offsetX + i * cellSize, offsetY + 9 * cellSize);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + i * cellSize);
            ctx.lineTo(offsetX + 9 * cellSize, offsetY + i * cellSize);
            ctx.stroke();
        }

        // Grid Labels (e.g. １〜９, 一〜九)
        ctx.fillStyle = "#18181b"; // zinc-900
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const xLabels = ["１", "２", "３", "４", "５", "６", "７", "８", "９"];
        const yLabels = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

        for (let i = 0; i < 9; i++) {
            // Top X Labels (from right to left)
            ctx.fillText(xLabels[i], offsetX + (8 - i) * cellSize + cellSize / 2, offsetY - 16);
            // Right Y Labels (from top to bottom)
            ctx.fillText(yLabels[i], offsetX + 9 * cellSize + 20, offsetY + i * cellSize + cellSize / 2);
        }

        // Draw Pieces
        const state = currentPlayer.getState();
        const board = state.board;
        ctx.font = "bold 28px serif";

        // Highlight last move if exists
        const lastMove = currentPlayer.getMoveFormat(currentPlayer.tesuu)?.move;
        if (lastMove && lastMove.to) {
            ctx.fillStyle = "rgba(59, 130, 246, 0.2)"; // blue-500 with opacity
            const lx = 9 - lastMove.to.x;
            const ly = lastMove.to.y - 1;
            ctx.fillRect(offsetX + lx * cellSize, offsetY + ly * cellSize, cellSize, cellSize);
        }

        // `board` in JSON-Kifu-Format: board[col][row] where col is 0-8 (0=9筋, 8=1筋), row is 0-8 (0=一段, 8=九段)
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                const piece = board[x][y];
                if (!piece || !piece.kind) continue;

                const char = PIECE_MAP[piece.kind] || "?";
                const isBlack = piece.color === 0;

                const printX = offsetX + (8 - x) * cellSize + cellSize / 2;
                const printY = offsetY + y * cellSize + cellSize / 2;

                ctx.save();
                ctx.translate(printX, printY);

                // Promote color override
                const isPromoted = ["TO", "NY", "NK", "NG", "UM", "RY"].includes(piece.kind);
                ctx.fillStyle = isPromoted ? "#dc2626" : "#09090b"; // red-600 or zinc-950

                if (!isBlack) {
                    // White (Gote) is upside down
                    ctx.rotate(Math.PI);
                }
                ctx.fillText(char, 0, 2); // 2px offset for visual center
                ctx.restore();
            }
        }

        // Draw hands (Simplified display)
        ctx.font = "bold 18px serif";
        ctx.textAlign = "left";

        // Gote (White) Hand - Top Left
        ctx.fillStyle = "#52525b"; // zinc-600
        ctx.fillText("☖ 持ち駒: " + formatHand(state.hands[1]), 20, 25);

        // Sente (Black) Hand - Bottom Right
        ctx.fillStyle = "#18181b"; // zinc-900
        ctx.fillText("☗ 持ち駒: " + formatHand(state.hands[0]), offsetX, height - 20);

    }, []);

    const formatHand = (hand: Record<string, number>) => {
        let str = "";
        for (const p of ["HI", "KA", "KI", "GI", "KE", "KY", "FU"]) {
            if (hand[p] > 0) {
                str += PIECE_MAP[p] + (hand[p] > 1 ? hand[p] : "") + " ";
            }
        }
        return str || "なし";
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextStep = parseInt(e.target.value, 10);
        player.goto(nextStep);
        setCurrentStep(nextStep);
    };

    const stepForward = () => {
        if (player.forward()) setCurrentStep(player.tesuu);
    };

    const stepBackward = () => {
        if (player.backward()) setCurrentStep(player.tesuu);
    };

    const generateGif = async () => {
        setIsGenerating(true);
        setProgress(0);
        setUploadError(null); // Clear previous errors

        const gif = createGifEncoder({ width: 640, height: 640, quality: 10 });

        // Go to start
        player.goto(0);

        const totalFrames = maxStep + 1;

        // We do rendering in a sync pseudo-loop to not lock up React completely 
        // but generating 100+ frames synchronously from canvas takes minimal time, 
        // encoding takes the time in worker.
        for (let i = 0; i <= maxStep; i++) {
            player.goto(i);
            drawBoard(player);

            // Add frame using the updated canvas. Delay: 500ms normal, 2000ms for last frame
            const delay = (i === maxStep) ? 2000 : 500;
            gif.addFrame(canvasRef.current as HTMLCanvasElement, { copy: true, delay });
        }

        // Restore to where user was
        player.goto(currentStep);
        drawBoard(player);

        gif.on('progress', p => {
            setProgress(Math.round(p * 100));
        });

        gif.on('finished', async (blob: Blob) => {
            setGeneratedBlob(blob);
            setProgress(100);

            try {
                const formData = new FormData();
                formData.append('file', blob, 'kifu.gif');

                // Use player info for title if available, otherwise default
                const header = player.kifu.header;
                const sentename = header?.Sente || header?.Sita || "先手";
                const gotename = header?.Gote || header?.Uwate || "後手";
                const title = header && (header.Sente || header.Gote)
                    ? `${sentename} vs ${gotename} の対局`
                    : "将棋 棋譜GIF";

                formData.append('title', title);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'アップロードに失敗しました');
                }

                const data = await res.json();

                // Redirect to share page
                router.push(`/share/${data.id}`);

            } catch (err: any) {
                console.error(err);
                setUploadError(err.message || "画像の保存に失敗しました。");
                setIsGenerating(false);
            }
        });

        gif.render();
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-between w-full items-center">
                <h2 className="text-xl font-bold">棋譜プレビュー</h2>
                <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
                    閉じる
                </button>
            </div>

            <div className="relative border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-[#ffffff]">
                <canvas ref={canvasRef} width={640} height={640} className="w-full h-auto object-contain max-w-[500px]" />
            </div>

            <div className="flex flex-col w-full gap-4 relative">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium w-12 text-right">{currentStep}/{maxStep}</span>
                    <input
                        type="range"
                        min="0"
                        max={maxStep}
                        value={currentStep}
                        onChange={handleSliderChange}
                        className="flex-1 cursor-pointer accent-primary"
                        disabled={isGenerating}
                    />
                </div>

                <div className="flex justify-center gap-3">
                    <button onClick={stepBackward} disabled={currentStep === 0 || isGenerating} className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors disabled:opacity-50">
                        <SkipBack size={20} />
                    </button>

                    <button onClick={() => setIsPlaying(!isPlaying)} disabled={isGenerating} className="p-3 bg-primary text-white hover:bg-primary-hover rounded-full transition-colors disabled:opacity-50">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button onClick={stepForward} disabled={currentStep === maxStep || isGenerating} className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors disabled:opacity-50">
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full my-4" />

                {uploadError && (
                    <div className="w-full p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center mb-2">
                        {uploadError}
                    </div>
                )}

                {!generatedBlob || uploadError ? (
                    <button
                        onClick={generateGif}
                        disabled={isGenerating}
                        className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <ImageIcon className="animate-pulse" size={20} />
                                {progress < 100 ? `画像生成中... ${progress}% ` : "サーバーへアップロード中..."}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Share2 size={20} />
                                GIFアニメーションを作成してシェア
                            </span>
                        )}
                    </button>
                ) : (
                    <div className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl text-center font-medium animate-pulse">
                        シェアページへリダイレクト中...
                    </div>
                )}

            </div>
        </div>
    );
}
