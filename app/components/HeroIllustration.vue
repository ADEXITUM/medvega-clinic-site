<template>
  <!-- Иллюстрация выполнена автором в SVG (см. docs/images.md) -->
  <svg class="illustration" viewBox="0 0 480 400" width="480" height="400" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#d4eef2" />
        <stop offset="1" stop-color="#eef7f9" />
      </linearGradient>
    </defs>
    <rect x="20" y="20" width="440" height="360" rx="40" fill="url(#hero-bg)" />
    <circle cx="380" cy="90" r="46" fill="#fbd9c9" />
    <!-- здание клиники -->
    <rect x="110" y="120" width="260" height="220" rx="18" fill="#fff" />
    <rect x="110" y="120" width="260" height="46" rx="18" fill="#0e6e7e" />
    <rect x="110" y="148" width="260" height="18" fill="#0e6e7e" />
    <path d="M230 128h20v12h12v20h-12v12h-20v-12h-12v-20h12z" fill="#fff" transform="translate(0 -4) scale(1)" />
    <g fill="#bfe3ea">
      <rect x="138" y="190" width="54" height="40" rx="8" />
      <rect x="213" y="190" width="54" height="40" rx="8" />
      <rect x="288" y="190" width="54" height="40" rx="8" />
      <rect x="138" y="250" width="54" height="40" rx="8" />
      <rect x="288" y="250" width="54" height="40" rx="8" />
    </g>
    <rect x="213" y="250" width="54" height="90" rx="8" fill="#0a5562" />
    <circle cx="256" cy="298" r="3" fill="#fff" />
    <!-- деревья -->
    <circle cx="78" cy="292" r="30" fill="#7cc6a4" />
    <rect x="74" y="300" width="8" height="40" rx="3" fill="#4d7f6a" />
    <circle cx="404" cy="300" r="24" fill="#7cc6a4" />
    <rect x="400" y="306" width="8" height="34" rx="3" fill="#4d7f6a" />
    <rect x="40" y="338" width="400" height="10" rx="5" fill="#9fd3dc" />
    <!-- сердце с пульсом -->
    <g transform="translate(330 40)">
      <rect width="96" height="64" rx="16" fill="#fff" />
      <path d="M12 34h18l8-14 10 26 8-18 6 6h22" fill="none" stroke="#c2410c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>
</template>

<style scoped>
.illustration {
  width: 100%;
  height: auto;
}
</style>
