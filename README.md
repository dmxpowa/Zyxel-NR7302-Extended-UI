# Zyxel NR7302 Extended UI (Userscript)

An enhanced **signal and radio diagnostics dashboard** for the **Zyxel NR7302** router, injected directly into the stock web UI using Tampermonkey.  
This userscript exposes detailed LTE + NR (5G NSA) metrics, live signal graphs, carrier aggregation info, and quick-action shortcuts — all **sandbox-safe** and browser-only.

---

## 📡 Supported Hardware

- ✅ **Zyxel NR7302**
  - LTE-A + 5G NSA
  - Stock Zyxel web interface
  - DAL endpoint: `/cgi-bin/DAL?oid=cellwan_status`

> ⚠️ This script is **specifically tailored for the NR7302**.  
> Other Zyxel models may work partially but are **not guaranteed** to expose the same variables or encryption behavior.

---

## 🌍 Regional Background

- **Revised and adapted for Austria**
  - Austria-friendly **MCC/MNC (232)** handling
  - PLMN-based operator detection
  - CellMapper links adjusted for Austrian mobile networks

---

## ✨ Features

- 📶 **Live signal metrics**  
  - LTE: RSRP, RSRQ, SINR, RSSI  
  - 5G NSA: NR RSRP, RSRQ, SINR, RSSI (when available)
- 📊 **Real-time bar graphs**
  - Rolling history (boxcar buffer)
  - **Color-coded bars represent real signal quality**
    - Green → excellent
    - Yellow → fair
    - Orange → poor
    - Red → very poor
- 📡 **Carrier Aggregation (CA) overview**
  - Primary + secondary carriers
  - Bandwidth display (DL / UL)
- 🗼 **ENB / Cell ID extraction**
  - Direct CellMapper integration
- 🔐 **AES-encrypted API support**
  - CryptoJS auto-loaded when required
- ⚡ **Quick actions**
  - Cell WAN status
  - Speedtest.net
  - Router reboot
  - Detailed radio info modal
- 🧩 Fully injected UI — **no firmware modification required**

---

## 📦 Installation

1. Install **Tampermonkey** (Chrome / Firefox / Edge)
2. Create a new userscript
3. Paste the script contents
4. Save and open your **Zyxel NR7302** web interface
5. The extended dashboard injects automatically after page load

---

## 🧑‍💻 Credits & Acknowledgements

This project builds upon and extends community work:

- **Original signal UI & Italian router implementation:**  
  **Miononno**
- **Enhancements & improvements:**  
  **Riskio87**
- **NR7302 specialization, Austria adaptation, UI extensions,  
  signal-quality color mapping, sandbox-safe rewrite:**  
  **dmxpowa**

All credit goes to the original authors for their foundational work ❤️  
Shared for **educational and diagnostic purposes**.

---

## 📜 License

Provided *as-is*, without warranty.  
Use only on hardware you own or are authorized to administer.

---

## 🤝 Contributing

Pull requests are welcome — especially for:
- Additional country presets
- More NR7302 firmware variants
- SA (Standalone 5G) support
- UI polish and performance tweaks
