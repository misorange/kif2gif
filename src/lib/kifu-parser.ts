import { JKFPlayer } from 'json-kifu-format';

/**
 * Reads a uploaded File and parses it into a JKFPlayer instance
 */
export async function parseKifuFile(file: File): Promise<JKFPlayer> {
    const buffer = await file.arrayBuffer();
    let text = "";

    const filename = file.name.toLowerCase();

    if (filename.endsWith('.kif') || filename.endsWith('.ki2')) {
        // KIF and KI2 are often Shift-JIS encoded.
        const decoder = new TextDecoder('shift-jis');
        text = decoder.decode(buffer);

        // If the text contains replacement characters, it might actually be UTF-8
        if (text.includes("")) {
            text = new TextDecoder('utf-8').decode(buffer);
        }
    } else {
        // .kifu and .jkf are typically UTF-8
        text = new TextDecoder('utf-8').decode(buffer);
    }

    try {
        let player: JKFPlayer;
        if (filename.endsWith('.jkf')) {
            player = JKFPlayer.parse(text);
        } else if (filename.endsWith('.ki2')) {
            player = JKFPlayer.parseKI2(text);
        } else {
            player = JKFPlayer.parseKIF(text);
        }
        return player;
    } catch (error) {
        console.error("KIF parsing error:", error);
        throw new Error("棋譜の解析に失敗しました。形式が正しくないか、非対応のファイルです。");
    }
}
