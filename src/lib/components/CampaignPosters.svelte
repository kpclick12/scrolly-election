<figure aria-label="Tre stiliserade svenska valaffischer. En har fått en ditritad mustasch och en annan har ett avrivet hörn.">
  <svg viewBox="0 0 620 500" role="img" aria-hidden="true">
    <path class="ground" d="M43 448 C194 430 425 432 578 449" />

    <g class="poster poster-back" transform="translate(318 70) rotate(5)">
      <path class="pole" d="M105 245 V390" />
      <rect class="sheet yellow" width="215" height="255" rx="3" />
      <path class="tape" d="M79 -8 H137" />
      <text x="22" y="50">MER</text>
      <text x="22" y="91">AV</text>
      <text x="22" y="132">ALLT</text>
      <circle class="portrait" cx="108" cy="190" r="35" />
      <path class="smile" d="M90 199 Q108 211 126 199" />
      <path class="moustache" d="M108 190 C97 178 84 184 88 194 C95 201 104 197 108 193 C112 197 121 201 128 194 C132 184 119 178 108 190" />
    </g>

    <g class="poster poster-front" transform="translate(74 112) rotate(-4)">
      <path class="pole" d="M118 263 V359" />
      <path class="sheet blue" d="M0 0 H235 V263 H0 Z" />
      <path class="tape" d="M86 -7 H151" />
      <text x="25" y="59">NU</text>
      <text x="25" y="105">VÄNDER</text>
      <text x="25" y="151">VI</text>
      <path class="scribble" d="M48 202 C83 171 111 238 151 194 C172 170 194 187 205 213" />
      <path class="pencil" d="M175 40 l20 17 m-12 -25 l20 17" />
    </g>

    <g class="poster poster-small" transform="translate(424 248) rotate(8)">
      <path class="pole" d="M74 163 V215" />
      <path class="sheet coral" d="M0 0 H148 V163 H0 Z" />
      <path class="tear" d="M115 0 H148 V42 L132 32 L123 45 L111 31 Z" />
      <text x="18" y="54">HELA</text>
      <text x="18" y="91">LANDET</text>
      <text class="small" x="18" y="128">(ungefär)</text>
    </g>
  </svg>
  <figcaption>Valrörelse, svensk standardutrustning.</figcaption>
</figure>

<style>
  figure { margin:0; color:var(--ink); }
  svg { display:block; width:100%; height:auto; overflow:visible; }
  .ground { fill:none; stroke:var(--rule-strong); stroke-width:2; stroke-linecap:round; }
  .pole { fill:none; stroke:#837b70; stroke-width:8; }
  .sheet { stroke:var(--ink); stroke-width:2; filter:drop-shadow(0 12px 12px rgba(37,39,46,.12)); }
  .blue { fill:#dce9ee; }
  .yellow { fill:#f2d36c; }
  .coral { fill:#ef9b7f; }
  .tape { fill:none; stroke:#d5cfbf; stroke-width:15; stroke-linecap:square; opacity:.8; }
  text { fill:var(--ink); font:800 35px/1 var(--sans); letter-spacing:-.04em; }
  text.small { font-size:18px; font-weight:650; letter-spacing:0; }
  .portrait { fill:#f7efe0; stroke:var(--ink); stroke-width:2; }
  .smile,.scribble,.pencil { fill:none; stroke:var(--ink); stroke-width:3; stroke-linecap:round; }
  .moustache { fill:var(--ink); }
  .tear { fill:var(--paper); stroke:var(--ink); stroke-width:2; }
  figcaption { margin:-5px 0 0; color:var(--muted-light); font-size:11px; text-align:center; }
  @media (max-width:820px) {
    figure { max-width:520px; margin:38px auto 0; }
    figcaption { font-size:10px; }
  }
  @media (prefers-reduced-motion:no-preference) {
    .poster { transform-box:fill-box; transform-origin:bottom center; animation:poster-in .7s both cubic-bezier(.22,.72,.22,1); }
    .poster-front { animation-delay:.08s; }
    .poster-small { animation-delay:.16s; }
    @keyframes poster-in { from { opacity:0; translate:0 18px; rotate:-1deg; } }
  }
</style>
