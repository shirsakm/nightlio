#!/usr/bin/env python3
"""
Remove green background from an image by making it transparent.

Two modes:
    1) HSV (default): remove greens by hue band, useful for a range of light greens.
        2) RGB: remove colors close to a target in RGB space (legacy mode).
        3) RESIZE: only resize, do not modify background.

Usage examples:
    # Default (HSV) tuned for light greens
    python scripts/remove_bg.py --input logo.png --output public/logo.png \
        --mode hsv --hue-min 70 --hue-max 170 --sat-min 0.15 --val-min 0.6 --feather 12

    # RGB (near #008000) with tolerance
        python scripts/remove_bg.py --mode rgb --tolerance 45

        # Resize only (no background removal)
        python scripts/remove_bg.py --mode resize --max-dim 512

Defaults:
    input:   ./logo.png
    output:  ./public/logo.png
    mode:    hsv
    hsv defaults: hue [70,170], sat>=0.15, val>=0.6, feather 12°
    rgb default tolerance: 40
        resize:  optional --max-dim, or --width/--height (preserves aspect if one provided)
"""
import sys
import os
from math import sqrt
import colorsys

try:
    from PIL import Image
except Exception as e:
    print("This script requires Pillow. Install it with: pip install Pillow", file=sys.stderr)
    raise

def parse_args(argv):
    # Defaults
    args = {
        'input': 'logo.png',
        'output': os.path.join('public', 'logo.png'),
        'mode': 'hsv',
        'tolerance': 40,      # for rgb mode
        'hue_min': 70.0,      # for hsv mode, degrees
        'hue_max': 170.0,     # for hsv mode, degrees
        'sat_min': 0.15,      # 0..1
        'val_min': 0.60,      # 0..1
    'feather': 12.0,      # degrees; soft edge
    'max_dim': None,      # e.g., 512
    'width': None,
    'height': None,
    }
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ('-i', '--input') and i + 1 < len(argv):
            args['input'] = argv[i+1]; i += 2
        elif a in ('-o', '--output') and i + 1 < len(argv):
            args['output'] = argv[i+1]; i += 2
        elif a in ('-m', '--mode') and i + 1 < len(argv):
            args['mode'] = argv[i+1].lower(); i += 2
        elif a in ('-t', '--tolerance') and i + 1 < len(argv):
            args['tolerance'] = int(argv[i+1]); i += 2
        elif a == '--hue-min' and i + 1 < len(argv):
            args['hue_min'] = float(argv[i+1]); i += 2
        elif a == '--hue-max' and i + 1 < len(argv):
            args['hue_max'] = float(argv[i+1]); i += 2
        elif a == '--sat-min' and i + 1 < len(argv):
            args['sat_min'] = float(argv[i+1]); i += 2
        elif a == '--val-min' and i + 1 < len(argv):
            args['val_min'] = float(argv[i+1]); i += 2
        elif a == '--feather' and i + 1 < len(argv):
            args['feather'] = float(argv[i+1]); i += 2
        elif a == '--max-dim' and i + 1 < len(argv):
            args['max_dim'] = int(argv[i+1]); i += 2
        elif a in ('-w', '--width') and i + 1 < len(argv):
            args['width'] = int(argv[i+1]); i += 2
        elif a in ('-h', '--height') and i + 1 < len(argv):
            args['height'] = int(argv[i+1]); i += 2
        else:
            i += 1
    return args

def dist(c1, c2):
    return sqrt(sum((int(c1[i]) - int(c2[i]))**2 for i in range(3)))

def remove_bg_rgb(im: Image.Image, tolerance: int = 40, target=(0, 128, 0)) -> Image.Image:
    im = im.convert('RGBA')
    data = list(im.getdata())
    new_data = []
    for (r, g, b, a) in data:
        if a != 0 and dist((r, g, b), target) <= tolerance:
            new_data.append((r, g, b, 0))
        else:
            new_data.append((r, g, b, a))
    out = Image.new('RGBA', im.size)
    out.putdata(new_data)
    return out

def remove_bg_hsv(im: Image.Image, hue_min=70.0, hue_max=170.0, sat_min=0.15, val_min=0.60, feather=12.0) -> Image.Image:
    """Remove a range of greens based on HSV.
    - hue in degrees [0,360), e.g., green ~120; light greens ~ 70..170.
    - feather adds a soft edge around the band (in degrees).
    """
    im = im.convert('RGBA')
    data = list(im.getdata())
    new_data = []
    core_min, core_max = float(hue_min), float(hue_max)
    soft_min, soft_max = core_min - float(feather), core_max + float(feather)
    for (r, g, b, a) in data:
        if a == 0:
            new_data.append((r, g, b, a))
            continue
        rf, gf, bf = r/255.0, g/255.0, b/255.0
        h, s, v = colorsys.rgb_to_hsv(rf, gf, bf)
        h_deg = (h * 360.0)
        if s < sat_min or v < val_min:
            new_data.append((r, g, b, a))
            continue
        if core_min <= h_deg <= core_max:
            new_data.append((r, g, b, 0))
        elif soft_min < h_deg < core_min:
            t = (h_deg - soft_min) / max(core_min - soft_min, 1e-6)
            alpha = int(a * (1 - t))
            new_data.append((r, g, b, alpha))
        elif core_max < h_deg < soft_max:
            t = (soft_max - h_deg) / max(soft_max - core_max, 1e-6)
            alpha = int(a * (1 - t))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, a))
    out = Image.new('RGBA', im.size)
    out.putdata(new_data)
    return out

def main():
    args = parse_args(sys.argv[1:])
    inp = args['input']; out = args['output']
    if not os.path.exists(inp):
        print(f"Input not found: {inp}", file=sys.stderr)
        sys.exit(1)
    im = Image.open(inp)
    mode = args['mode']
    if mode == 'resize':
        im2 = im.convert('RGBA') if im.mode != 'RGBA' else im
    elif mode == 'rgb':
        im2 = remove_bg_rgb(im, tolerance=args['tolerance'])
    else:
        im2 = remove_bg_hsv(
            im,
            hue_min=args['hue_min'], hue_max=args['hue_max'],
            sat_min=args['sat_min'], val_min=args['val_min'],
            feather=args['feather']
        )
    # Optional resize (downscale)
    w, h = im2.size
    new_w, new_h = w, h
    if args['width'] and args['height']:
        new_w, new_h = int(args['width']), int(args['height'])
    elif args['width'] and not args['height']:
        scale = float(args['width']) / float(w)
        if scale < 1:
            new_w = int(w * scale)
            new_h = int(h * scale)
    elif args['height'] and not args['width']:
        scale = float(args['height']) / float(h)
        if scale < 1:
            new_w = int(w * scale)
            new_h = int(h * scale)
    elif args['max_dim']:
        md = float(args['max_dim'])
        scale = md / float(max(w, h))
        if scale < 1:
            new_w = int(w * scale)
            new_h = int(h * scale)
    if (new_w, new_h) != (w, h):
        # Choose a high-quality resample filter with compatibility across Pillow versions
        Resampling = getattr(Image, 'Resampling', None)
        if Resampling is not None:
            resample_filter = Resampling.LANCZOS
        else:
            resample_filter = getattr(Image, 'LANCZOS', getattr(Image, 'ANTIALIAS', 1))
        im2 = im2.resize((max(1, new_w), max(1, new_h)), resample_filter)

    os.makedirs(os.path.dirname(out), exist_ok=True)
    im2.save(out, 'PNG')
    out_path = out
    print(f"Wrote: {out_path}")

if __name__ == '__main__':
    main()
