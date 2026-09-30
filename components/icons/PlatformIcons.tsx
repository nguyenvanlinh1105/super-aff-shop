export type IconProps = { size?: number; className?: string; pure?: boolean };

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

export function FacebookIcon({ size = 22, className = "", pure = false }: IconProps) {
  if (pure) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <rect width="48" height="48" rx="12" fill="#1877F2" />
      <path
        d="M32 25.5l.8-5.5h-5.3v-3.6c0-1.5.7-3 3.1-3h2.4V8.7s-2.2-.4-4.3-.4c-4.4 0-7.3 2.7-7.3 7.5v4.2H16.5v5.5h4.9V39h6.3V25.5H32z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function ZaloIcon({ size = 22, className = "", pure = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {!pure && <rect width="48" height="48" rx="12" fill="#0068FF" />}
      <g transform={pure ? "translate(3.6, 3.6) scale(1.7)" : "translate(4.8, 4.8) scale(1.6)"}>
        <path
          fill="#FFFFFF"
          d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9453 0 1.0746.8697 1.9453 1.945 1.9453z"
        />
      </g>
    </svg>
  );
}

export function YoutubeIcon({ size = 22, className = "", pure = false }: IconProps) {
  if (pure) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <rect width="48" height="48" rx="12" fill="#FF0000" />
      <path d="M38.5 16.2a3.8 3.8 0 0 0-2.7-2.7C33.4 12.8 24 12.8 24 12.8s-9.4 0-11.8.7a3.8 3.8 0 0 0-2.7 2.7C9 18.6 9 24 9 24s0 5.4.5 7.8a3.8 3.8 0 0 0 2.7 2.7c2.4.7 11.8.7 11.8.7s9.4 0 11.8-.7a3.8 3.8 0 0 0 2.7-2.7c.5-2.4.5-7.8.5-7.8s0-5.4-.5-7.8zM21 28.5V19.5L28.8 24 21 28.5z" fill="#FFFFFF" />
    </svg>
  );
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
      <rect width="48" height="48" rx="12" fill="#EE4D2D" />
      {/* Quai túi Shopee */}
      <path
        d="M18 18.5C18 15.2 20.7 12.5 24 12.5C27.3 12.5 30 15.2 30 18.5"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Thân túi Shopee */}
      <path
        d="M12 18.5H36L34.2 37.2C34.1 38.2 33.2 39 32.2 39H15.8C14.8 39 13.9 38.2 13.8 37.2L12 18.5Z"
        fill="#FFFFFF"
      />
      {/* Chữ S Shopee */}
      <path
        d="M26 24.2C25.5 23.9 24.8 23.7 24 23.7C22.6 23.7 21.7 24.3 21.7 25.3C21.7 26.2 22.4 26.7 24.2 27.2C26.4 27.7 27.6 28.7 27.6 30.6C27.6 32.8 25.7 34 23.6 34C21.9 34 20.6 33.4 19.9 32.3L21.4 31.2C21.9 32 22.7 32.5 23.7 32.5C24.9 32.5 25.8 32 25.8 30.9C25.8 30 25.1 29.5 23.3 29C21.3 28.5 20.1 27.5 20.1 25.7C20.1 23.8 21.7 22.4 23.9 22.4C25.3 22.4 26.4 22.9 27.1 23.7L26 24.2Z"
        fill="#EE4D2D"
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

export function TiktokIcon({ size = 22, className = "", pure = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {!pure && <rect width="48" height="48" rx="12" fill="#0A0A0A" />}
      <g transform={pure ? "translate(6, 6) scale(1.3)" : "translate(10, 10)"}>
        {/* Bóng Cyan */}
        <path
          d="M20.5 7.8a5.5 5.5 0 0 1-4.1-4V3.5h-3v12.2a2.7 2.7 0 0 1-2.7 2.7 2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6.1.9.2V9.8c-.3 0-.6-.1-.9-.1a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6V9.6a7.8 7.8 0 0 0 3.8 1V7.8z"
          fill="#25F4EE"
          transform="translate(-0.7, -0.5)"
        />
        {/* Bóng Hồng/Đỏ */}
        <path
          d="M20.5 7.8a5.5 5.5 0 0 1-4.1-4V3.5h-3v12.2a2.7 2.7 0 0 1-2.7 2.7 2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6.1.9.2V9.8c-.3 0-.6-.1-.9-.1a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6V9.6a7.8 7.8 0 0 0 3.8 1V7.8z"
          fill="#FE2C55"
          transform="translate(0.7, 0.5)"
        />
        {/* Nốt nhạc trắng */}
        <path
          d="M20.5 7.8a5.5 5.5 0 0 1-4.1-4V3.5h-3v12.2a2.7 2.7 0 0 1-2.7 2.7 2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6.1.9.2V9.8c-.3 0-.6-.1-.9-.1a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6V9.6a7.8 7.8 0 0 0 3.8 1V7.8z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
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
      <g transform="translate(7.5, 10.5) scale(0.48, 0.48)">
        <defs>
          <linearGradient id="lzHeart" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FF9200" />
            <stop offset="25%" stopColor="#F36D00" />
            <stop offset="55%" stopColor="#F83C72" />
            <stop offset="78%" stopColor="#FC1CBE" />
            <stop offset="100%" stopColor="#FF00FF" />
          </linearGradient>
          <linearGradient id="lzRight" x1="20%" y1="90%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#000083" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000083" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lzLeft" x1="60%" y1="70%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#ED6600" stopOpacity="0.4" />
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

