"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface KifuUploaderProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

export default function KifuUploader({ onFileSelect, isLoading = false }: KifuUploaderProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            validateAndSelectFile(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            validateAndSelectFile(file);
        }
    };

    const validateAndSelectFile = (file: File) => {
        // Only accept .kif, .kifu, .ki2 files roughly
        const filename = file.name.toLowerCase();
        if (filename.endsWith('.kif') || filename.endsWith('.kifu') || filename.endsWith('.ki2') || filename.endsWith('.jkf')) {
            onFileSelect(file);
        } else {
            alert("申し訳ありません、現在対応しているのは .kif 形式や .jkf 形式の将棋棋譜のみです。");
        }
    };

    return (
        <div
            onClick={() => !isLoading && inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
                isDragActive
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                isLoading && "pointer-events-none opacity-60"
            )}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".kif,.kifu,.ki2,.jkf"
                onChange={handleChange}
                className="hidden"
                disabled={isLoading}
            />

            <div className={cn(
                "rounded-full p-4 mb-4 transition-transform duration-300",
                isDragActive ? "bg-primary text-white scale-110" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 group-hover:text-primary dark:group-hover:text-primary"
            )}>
                {isLoading ? (
                    <FileText className="h-8 w-8 animate-pulse" />
                ) : (
                    <UploadCloud className="h-8 w-8" />
                )}
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {isLoading ? "読み込み中..." : "Kifu (棋譜) ファイルをアップロード"}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                ドラッグ＆ドロップ、またはクリックしてファイルを選択してください。<br />
                <span className="text-xs opacity-75 mt-1 inline-block">対応形式: .kif, .kifu, .ki2, .jkf</span>
            </p>
        </div>
    );
}
