#!/usr/bin/env python3
"""Generate crisp ONE SECOND icons and iOS launch images with Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
IVORY = '#FAF7F0'; PEACH = '#EFB7A8'; MINT = '#B9D8C5'; LAV = '#C9BDE8'; INK = '#353431'

def render_icon(size, maskable=False):
    scale=4; n=size*scale; im=Image.new('RGBA',(n,n),IVORY); d=ImageDraw.Draw(im)
    pad=int(n*(.12 if maskable else .07)); d.rounded_rectangle((pad,pad,n-pad,n-pad),radius=int(n*.21),fill=IVORY)
    cx=cy=n/2; r=n*.285; w=n*.06
    d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=LAV,width=int(w))
    # Mint target arc
    box=(cx-r,cy-r,cx+r,cy+r); d.arc(box,218,248,fill=MINT,width=int(w*1.28))
    import math
    a=315*math.pi/180; bx=cx+math.cos(a)*r; by=cy+math.sin(a)*r; br=n*.055
    d.ellipse((bx-br,by-br,bx+br,by+br),fill=PEACH)
    return im.resize((size,size),Image.Resampling.LANCZOS).convert('RGB')

def render_splash(w,h):
    scale=2; W=w*scale; H=h*scale; im=Image.new('RGB',(W,H),IVORY); d=ImageDraw.Draw(im)
    cx=W/2; cy=H*.47; r=min(W,H)*.095; sw=max(8,int(W*.012))
    d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=LAV,width=sw)
    d.arc((cx-r,cy-r,cx+r,cy+r),218,248,fill=MINT,width=int(sw*1.35))
    import math
    a=315*math.pi/180; br=r*.17; bx=cx+math.cos(a)*r; by=cy+math.sin(a)*r
    d.ellipse((bx-br,by-br,bx+br,by+br),fill=PEACH)
    # wordmark via system default; styled enough for splash, avoids bundled fonts
    try:
        from PIL import ImageFont
        font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(W*.043))
    except OSError: font=None
    text='ONE SECOND'; bb=d.textbbox((0,0),text,font=font); d.text((cx-(bb[2]-bb[0])/2,cy+r+H*.045),text,fill=INK,font=font)
    return im.resize((w,h),Image.Resampling.LANCZOS)

def main():
    icons=ROOT/'icons'; splash=ROOT/'splash'; icons.mkdir(exist_ok=True); splash.mkdir(exist_ok=True)
    for size,name,mask in [(180,'icon-180.png',False),(192,'icon-192.png',False),(512,'icon-512.png',False),(192,'maskable-192.png',True),(512,'maskable-512.png',True),(32,'favicon-32.png',False)]: render_icon(size,mask).save(icons/name,optimize=True)
    for w,h in [(1170,2532),(1179,2556),(1290,2796),(1284,2778),(1125,2436),(750,1334),(828,1792)]: render_splash(w,h).save(splash/f'splash-{w}x{h}.png',optimize=True)
if __name__=='__main__': main()
