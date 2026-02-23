import { ImageResponse } from 'next/og';

// App Router will automatically generate the corresponding `<link rel="icon" ... />`
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)', // Purple to Orange gradient
                    borderRadius: '50%', // Circle
                    color: 'white',
                    fontSize: 22,
                    fontWeight: 800,
                }}
            >
                歩
            </div>
        ),
        { ...size }
    );
}
