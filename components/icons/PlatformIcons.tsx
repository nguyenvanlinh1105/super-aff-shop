type IconProps = { size?: number; className?: string };

function Icons8Image({
  size = 22,
  className = "",
  style,
  slug,
  alt,
}: IconProps & { style: string; slug: string; alt: string }) {
  return (
    <img
      src={`https://img.icons8.com/${style}/96/${slug}.png`}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export function FacebookIcon(props: IconProps) {
  return <Icons8Image {...props} style="color" slug="facebook-new" alt="Facebook" />;
}

export function ZaloIcon(props: IconProps) {
  return <Icons8Image {...props} style="color" slug="zalo" alt="Zalo" />;
}

export function YoutubeIcon(props: IconProps) {
  return <Icons8Image {...props} style="color" slug="youtube-play" alt="Youtube" />;
}

export function InstagramIcon(props: IconProps) {
  return <Icons8Image {...props} style="color" slug="instagram-new" alt="Instagram" />;
}

export function ThreadsIcon(props: IconProps) {
  return <Icons8Image {...props} style="ios-filled" slug="threads" alt="Threads" />;
}

export function ShopeeIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 16.5C10 14.567 11.567 13 13.5 13h21c1.933 0 3.5 1.567 3.5 3.5V37a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V16.5Z"
        fill="#EE4D2D"
      />
      <path
        d="M17 16v-2.5a7 7 0 1 1 14 0V16"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18.5 24.5c0 1.9 1.79 2.6 4.2 3.3 3 .9 6.3 1.9 6.3 5.4 0 2.9-2.55 4.8-6.13 4.8-2.66 0-4.98-.98-6.37-2.66"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.2-17.1 10.4Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.7 34.5 27 35.5 24 35.5c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5C9.1 39.6 16 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.6 36.5 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5Z"
      />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return <Icons8Image {...props} style="color" slug="tiktok" alt="Tiktok" />;
}

export function LazadaIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="12" fill="#0F146D" />
      <g transform="translate(6.5, 9.5) scale(0.515, 0.515)">
        <defs>
          <linearGradient id="lzHeart" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FF9200" />
            <stop offset="25%" stopColor="#F36D00" />
            <stop offset="55%" stopColor="#F83C72" />
            <stop offset="78%" stopColor="#FC1CBE" />
            <stop offset="100%" stopColor="#FF00FF" />
          </linearGradient>
          <linearGradient id="lzRight" x1="20%" y1="90%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#000083" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000083" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lzLeft" x1="60%" y1="70%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#ED6600" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F98200" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#lzHeart)"
          d="M 33.7366,54.7161 C 33.2581,54.7194 32.7871,54.5969 32.3707,54.361 28.8059,52.2985 2.4039,35.7444 1.40683,35.239 0.648025,34.8849 0.129878,34.1595 0.0409756,33.3268 V 10.1073 C 0.0213409,9.24058 0.449817,8.42493 1.17463,7.94927 L 1.36585,7.84 C 3.92,6.25561 12.4702,1.03805 13.8224,0.286829 14.1327,0.102692 14.4861,0.00374668 14.8468,0 c 0.3382,0.00382664 0.6706,0.0881007 0.9698,0.245854 0,0 11.9649,7.799026 13.7951,8.495606 1.2842,0.59 2.6845,0.88406 4.0976,0.86049 1.6012,0.03347 3.1834,-0.35265 4.5892,-1.12 C 40.0878,7.53951 51.52,0.286829 51.6429,0.286829 51.9311,0.112743 52.2623,0.0228451 52.599,0.0273171 52.9601,0.0290843 53.3139,0.128172 53.6234,0.314146 55.1805,1.17463 65.7795,7.66244 66.2302,7.94927 66.9757,8.39902 67.4276,9.20946 67.4185,10.08 v 23.2195 c -0.0836,0.8347 -0.6034,1.5624 -1.3658,1.9122 -0.9971,0.5463 -27.3171,17.1005 -30.9503,19.122 -0.4136,0.2455 -0.8848,0.3774 -1.3658,0.3824"
        />
        <path
          fill="url(#lzRight)"
          d="m 33.6,54.7162 0.1366,-1e-4 c 0.4785,0.0033 0.9495,-0.1192 1.3658,-0.3551 3.5649,-2.0625 29.9532,-18.6166 30.9503,-19.122 0.7624,-0.3498 1.2822,-1.0775 1.3658,-1.9122 V 10.1073 C 67.4229,9.71423 67.334,9.32571 67.159,8.97366 L 33.6,27.399 v 27.3172"
        />
        <path
          fill="url(#lzLeft)"
          transform="translate(67.2, 0) scale(-1, 1)"
          d="m 33.6,54.7162 0.1366,-1e-4 c 0.4785,0.0033 0.9495,-0.1192 1.3658,-0.3551 3.5649,-2.0625 29.9532,-18.6166 30.9503,-19.122 0.7624,-0.3498 1.2822,-1.0775 1.3658,-1.9122 V 10.1073 C 67.4229,9.71423 67.334,9.32571 67.159,8.97366 L 33.6,27.399 v 27.3172"
        />
      </g>
    </svg>
  );
}

export function TelegramIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" className={className}>
      <circle cx="120" cy="120" r="120" fill="#24A1DE" />
      <path
        fill="#FFF"
        d="M98 175c-4 0-3-2-5-6l-14-46 102-64c5-3 9-1 6 2L67 141l-24-7c-5-2-5-5 1-7l146-56c7-3 13 2 11 10L174 163c-2 10-8 12-16 7l-45-33-22 21c-2 3-5 4-9 4z"
      />
    </svg>
  );
}

