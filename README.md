# Shudan Goban

A highly customizable, low-level Goban web component.

<img src="./screenshot.png" alt="Screenshot" width="600" />

## Features

- 📐 Resizable
- ⌨️ Keyboard accessibility
- 🔠 Board coordinates
- 🎛️ Easy customization
- 🧱 Flexible layer system
- 🧩 Partial board support

## Usage

Import library and use the web components directly in your HTML. A minimal setup
looks like follows:

```html
<script>
  import "@sabaki/shudan";
</script>

<shudan-goban coords width="9" height="9">
  <shudan-grid-layer></shudan-grid-layer>
  <shudan-stone-layer stones='{"C3": 1, "G7": -1}'></shudan-stone-layer>
</shudan-goban>
```
