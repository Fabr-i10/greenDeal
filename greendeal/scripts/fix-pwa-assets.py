from PIL import Image, ImageDraw
import os

base = os.path.join(os.path.dirname(__file__), "..", "img")
src_path = os.path.join(base, "icon_x512.png")
src = Image.open(src_path).convert("RGBA")

for size in [48, 72, 96, 128, 192, 384, 512]:
    img = src.resize((size, size), Image.Resampling.LANCZOS)
    img.save(os.path.join(base, f"icon_x{size}.png"), optimize=True)


def maskable_icon(size, bg=(26, 56, 48, 255)):
    inner = int(size * 0.8)
    icon = src.resize((inner, inner), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    offset = (size - inner) // 2
    canvas.paste(icon, (offset, offset), icon)
    return canvas


maskable_icon(192).save(os.path.join(base, "icon_x192-maskable.png"), optimize=True)
maskable_icon(512).save(os.path.join(base, "icon_x512-maskable.png"), optimize=True)

shots = os.path.join(base, "screenshots")
os.makedirs(shots, exist_ok=True)

PRIMARY = (18, 40, 32)
ACCENT = (212, 196, 138)
MINT = (200, 237, 212)


def draw_branded(size, subtitle=None):
    w, h = size
    img = Image.new("RGB", size, PRIMARY)
    draw = ImageDraw.Draw(img)
    header_h = int(h * 0.12)
    draw.rectangle([0, 0, w, header_h], fill=(26, 56, 48))
    icon_size = min(56, w // 7)
    icon = src.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    ix, iy = 16, max(10, header_h // 2 - icon_size // 2)
    img.paste(icon, (ix, iy), icon)
    draw.text((ix + icon_size + 12, int(h * 0.045)), "GreenDeal", fill=MINT)
    if subtitle:
        draw.text((ix + icon_size + 12, int(h * 0.045) + 24), subtitle, fill=ACCENT)
    card_y = int(h * 0.2)
    card_h = max(48, int(h * 0.1))
    for i in range(3):
        y = card_y + i * (card_h + 14)
        draw.rounded_rectangle([16, y, w - 16, y + card_h], radius=12, fill=(32, 62, 52))
    if h > w:
        nav_h = int(h * 0.09)
        draw.rectangle([0, h - nav_h, w, h], fill=(22, 48, 40))
    return img


draw_branded((390, 844), "Gestión turística").save(os.path.join(shots, "mobile.png"), optimize=True)
draw_branded((1280, 720), "Panel de gestión").save(os.path.join(shots, "wide.png"), optimize=True)

print("Done")
