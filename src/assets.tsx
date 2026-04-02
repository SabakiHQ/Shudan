import type { FunctionalComponent, JSX } from "sinho";

export const BlackStone: FunctionalComponent<
  JSX.IntrinsicElements["symbol"]
> = (props) => (
  <symbol {...props} viewBox="0 0 43 43">
    <defs>
      <linearGradient
        id="shudan-b-ambient"
        x1="0"
        x2="0"
        y1="2.38"
        y2="19.27"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#636363" stop-opacity=".4" />
        <stop offset="1" stop-color="#636363" stop-opacity="0" />
      </linearGradient>
      <linearGradient
        id="shudan-b-base"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#0b0b0b" />
        <stop offset="1" stop-color="#463330" />
      </linearGradient>

      <radialGradient id="shudan-b-specular" cx="32%" cy="28%" r="18%">
        <stop offset="0" stop-color="#f5d1ca" stop-opacity="0.9" />
        <stop offset="0.15" stop-color="#f5d1ca" stop-opacity="0.6" />
        <stop offset="0.35" stop-color="#f5d1ca" stop-opacity="0.25" />
        <stop offset="1" stop-color="#f5d1ca" stop-opacity="0" />
      </radialGradient>

      <mask id="shudan-b-stone-mask">
        <circle cx="21.5" cy="21.5" r="18.5" fill="white" />
      </mask>
    </defs>

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#shudan-b-base)"
      stroke="#35302c"
      stroke-width="1"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#shudan-b-ambient)" />

    <g mask="url(#shudan-b-stone-mask)">
      <ellipse
        cx="20"
        cy="9"
        rx="24"
        ry="12"
        fill="url(#shudan-b-specular)"
        transform="rotate(-40 20 9)"
        opacity=".6"
      />
      <ellipse
        cx="41"
        cy="31"
        rx="24"
        ry="12"
        fill="url(#shudan-b-specular)"
        transform="rotate(-40 41 31)"
        opacity=".4"
      />
    </g>
  </symbol>
);

export const WhiteStone: FunctionalComponent<
  JSX.IntrinsicElements["symbol"]
> = (props) => (
  <symbol {...props} viewBox="0 0 43 43">
    <defs>
      <linearGradient
        id="shudan-w-ambient"
        x1="0"
        x2="0"
        y1="40.65"
        y2="30.65"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#f6f7ff" stop-opacity=".6" />
        <stop offset="1" stop-color="#f6f7ff" stop-opacity="0" />
      </linearGradient>

      <linearGradient
        id="shudan-w-base"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#d6d8ed" />
        <stop offset="1" stop-color="#f6f7ff" />
      </linearGradient>

      <filter id="shudan-w-wavy">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.08 0.02"
          numOctaves="2"
          seed="15"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          result="displacement"
          scale="3"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feGaussianBlur in="displacement" stdDeviation=".5" />
      </filter>

      <radialGradient id="shudan-w-specular" cx="32%" cy="28%" r="18%">
        <stop offset="0" stop-color="#fff" />
        <stop offset=".15" stop-color="#fff" stop-opacity=".6" />
        <stop offset=".35" stop-color="#fff" stop-opacity=".25" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </radialGradient>

      <mask id="shudan-w-stone-mask">
        <circle cx="21.5" cy="21.5" r="18.5" fill="#fff" />
      </mask>
    </defs>

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#shudan-w-base)"
      stroke="#c3c3c3"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#shudan-w-ambient)" />

    <g
      style={{
        transformOrigin: "21.5px 21.5px",
        transform: "rotate(calc(var(--shudan-random) * 360deg))",
      }}
      mask="url(#shudan-w-stone-mask)"
      filter="url(#shudan-w-wavy)"
      stroke="#c0bab6"
      stroke-width="2"
      fill="none"
      opacity=".4"
    >
      <path d="M0 0h43v43H0z" />
      <path d="M1.324 32.87s2.363 1.361 5.347 2.326c7.343 2.373 22.915 2.014 27.722-.008 4.507-1.895 7.33-3.361 7.33-3.361" />
      <path d="M1.084 28.41s1.761 1.731 4.826 2.4c7.398 1.616 25.49 1.16 30.253-.23 4.694-1.371 6.623-2.655 6.623-2.655" />
      <path d="M.5 23.603s1.8 1.575 4.826 2.4c6.273 1.712 26.148.736 30.253-.23 4.73-1.114 6.623-2.654 6.623-2.654" />
      <path d="M.5 18.697s1.79 1.996 4.863 2.624c7.093 1.45 26.466.914 30.254-.23 4.68-1.415 6.585-2.878 6.585-2.878" />
      <path d="M.845 11.242s2.089 3.103 4.922 4.45c5.32 2.528 25.884 1.896 30.141.587 3.36-1.033 6.247-4.54 6.247-4.54" />
      <path d="M5.197 6.028s1.753 3.704 4.33 5.493c2.754 1.913 22.354 2.028 25.744-.813C38.68 7.85 38.916 5.26 38.916 5.26" />
      <path d="M13.052 1.988s-3.576 2.675-.907 4.323c3.863 2.386 14.317 3.192 18.64.25 4-2.723-.722-4.455-.722-4.455" />
    </g>

    <g mask="url(#shudan-w-stone-mask)" fill="url(#shudan-w-specular)">
      <ellipse cx="20" cy="9" rx="24" ry="12" transform="rotate(-40 20 9)" />
      <ellipse
        cx="41"
        cy="31"
        rx="24"
        ry="12"
        transform="rotate(-40 41 31)"
        opacity=".6"
      />
    </g>
  </symbol>
);
