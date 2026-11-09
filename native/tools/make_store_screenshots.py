#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT=Path(__file__).resolve().parents[2]; RAW=ROOT/'store-raw'; IV=(250,247,240); IN=(53,52,49); FONT='/usr/share/fonts/truetype/sand-box/google/Poppins/Poppins-Bold.ttf'
heads=['One tap. One second.','Hit the arc. Go PERFECT.','Every 5 hits, it speeds up.','Beat your best score.']
def compose(src,out,size,headline):
 W,H=size; im=Image.new('RGB',size,IV); d=ImageDraw.Draw(im); f=ImageFont.truetype(FONT,int(W*.047));
 while d.textbbox((0,0),headline,font=f)[2] > W*.9: f=ImageFont.truetype(FONT,f.size-1)
 bb=d.textbbox((0,0),headline,font=f);d.text(((W-bb[2])/2,H*.045),headline,font=f,fill=IN)
 with Image.open(src) as raw: raw=raw.convert('RGB'); target_h=int(H*.82); target_w=int(target_h*raw.width/raw.height); raw=raw.resize((target_w,target_h),Image.Resampling.LANCZOS)
 maxw=int(W*.9)
 if raw.width>maxw: raw=raw.resize((maxw,int(raw.height*maxw/raw.width)),Image.Resampling.LANCZOS)
 x=(W-raw.width)//2;y=int(H*.15)
 # subtle shadow and rounded mask
 shadow=Image.new('RGBA',size,(0,0,0,0));sd=ImageDraw.Draw(shadow);rad=int(W*.06);sd.rounded_rectangle((x,y+int(H*.008),x+raw.width,y+raw.height+int(H*.008)),radius=rad,fill=(40,35,25,30));shadow=shadow.filter(ImageFilter.GaussianBlur(W*.018));im=Image.alpha_composite(im.convert('RGBA'),shadow)
 mask=Image.new('L',raw.size,0);ImageDraw.Draw(mask).rounded_rectangle((0,0,raw.width-1,raw.height-1),radius=rad,fill=255);im.paste(raw,(x,y),mask);im.convert('RGB').save(out,optimize=True)
for setname,prefix,size,folder in [('69','69',(1320,2868),'6.9'),('65','65',(1284,2778),'6.5'),('play','play',(1080,1920),None)]:
 outdir=ROOT/'playstore/screenshots' if setname=='play' else ROOT/'appstore/screenshots'/folder;outdir.mkdir(parents=True,exist_ok=True)
 for i,h in enumerate(heads,1): compose(RAW / (f'{prefix}-{i}-' + ['start','perfect','levelup','gameover'][i-1] + '.png'),outdir/f'{i:02d}.png',size,h)
