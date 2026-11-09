#!/usr/bin/env python3
from pathlib import Path
import math, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT=Path(__file__).resolve().parents[2]; N=ROOT/'native'; IV='#FAF7F0'; PE='#EFB7A8'; MI='#B9D8C5'; LA='#C9BDE8'; IN='#353431'
BOLD='/usr/share/fonts/truetype/sand-box/google/Poppins/Poppins-Bold.ttf'; MED='/usr/share/fonts/truetype/sand-box/google/Poppins/Poppins-Medium.ttf'
def mark(d,cx,cy,r,w):
 d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=LA,width=int(w)); d.arc((cx-r,cy-r,cx+r,cy+r),218,248,fill=MI,width=int(w*1.3)); a=math.radians(315); br=r*.18; x=cx+math.cos(a)*r;y=cy+math.sin(a)*r;d.ellipse((x-br,y-br,x+br,y+br),fill=PE)
def icon(size):
 sc=4; z=size*sc; im=Image.new('RGB',(z,z),IV);d=ImageDraw.Draw(im);mark(d,z/2,z/2,z*.285,z*.06);return im.resize((size,size),Image.Resampling.LANCZOS)
def splash(w,h):
 sc=2;W=w*sc;H=h*sc;im=Image.new('RGB',(W,H),IV);d=ImageDraw.Draw(im);r=min(W,H)*.095;mark(d,W/2,H*.45,r,max(3,int(W*.012)));f=ImageFont.truetype(BOLD,int(W*.043));t='ONE SECOND';b=d.textbbox((0,0),t,font=f);d.text((W/2-(b[2]-b[0])/2,H*.45+r+H*.045),t,font=f,fill=IN);return im.resize((w,h),Image.Resampling.LANCZOS)
def main():
 (N/'ios/App/App/Assets.xcassets/AppIcon.appiconset').mkdir(parents=True,exist_ok=True);icon(1024).save(N/'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
 for name in ['splash-2732x2732.png','splash-2732x2732-1.png','splash-2732x2732-2.png']: splash(2732,2732).save(N/'ios/App/App/Assets.xcassets/Splash.imageset'/name)
 for folder in ['ios/App/App/Assets.xcassets/AppIcon.appiconset']:
  Path(N/folder/'Contents.json').write_text(json.dumps({'images':[{'filename':'AppIcon-512@2x.png','idiom':'universal','platform':'ios','size':'1024x1024'}],'info':{'author':'xcode','version':1}},indent=2)+'\n')
 for density,size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
  out=N/f'android/app/src/main/res/mipmap-{density}';out.mkdir(exist_ok=True)
  for fn in ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png']: icon(size).save(out/fn)
 # replace adaptive foreground vector with generated raster foreground source reference
 p=N/'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml';p.write_text('''<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>\n''')
 p=N/'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml';p.write_text('''<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>\n''')
 (N/'android/app/src/main/res/values/ic_launcher_background.xml').write_text('<resources><color name="ic_launcher_background">#FAF7F0</color></resources>\n')
 for folder in (N/'android/app/src/main/res').glob('drawable*'):
  if folder.name.startswith('drawable') and (folder/'splash.png').exists():
   name=folder.name
   # retain template image dimensions exactly
   with Image.open(folder/'splash.png') as old: size=old.size
   splash(*size).save(folder/'splash.png')
 for folder in ['appstore','playstore']:(ROOT/folder).mkdir(exist_ok=True)
 icon(1024).save(ROOT/'appstore/icon-1024.png');icon(512).save(ROOT/'playstore/icon-512.png')
 W,H=1024,500;im=Image.new('RGB',(W,H),IV);d=ImageDraw.Draw(im);mark(d,205,250,105,12);fb=ImageFont.truetype(BOLD,62);fm=ImageFont.truetype(MED,25);d.text((380,170),'ONE SECOND',font=fb,fill=IN);d.text((384,265),'One tap. One moment. One more try.',font=fm,fill=IN);im.save(ROOT/'playstore/feature-graphic-1024x500.png')
if __name__=='__main__': main()
