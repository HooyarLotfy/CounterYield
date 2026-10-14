import os
import subprocess

svg = "/root/build-counteryield-apk/mobile/assets/logo-counteryield-2.5d.svg"
res = "/root/build-counteryield-apk/mobile/android/app/src/main/res"

densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

for folder, size in densities.items():
    for name in ["ic_launcher.png", "ic_launcher_round.png"]:
        dest = os.path.join(res, folder, name)
        subprocess.run(
            ["rsvg-convert", "-w", str(size), "-h", str(size), svg, "-o", dest],
            check=True,
        )
        print(f"Created {dest} ({os.path.getsize(dest)} bytes)")

# Also create high-res Expo icon assets
subprocess.run(
    ["rsvg-convert", "-w", "1024", "-h", "1024", svg, "-o", "/root/build-counteryield-apk/mobile/assets/icon.png"],
    check=True,
)
subprocess.run(
    ["rsvg-convert", "-w", "1024", "-h", "1024", svg, "-o", "/root/build-counteryield-apk/mobile/assets/adaptive-icon.png"],
    check=True,
)
print("SUCCESS: All Android launcher mipmap icons generated from 2.5D SVG!")
