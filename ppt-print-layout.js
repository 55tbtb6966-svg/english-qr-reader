// v2.3.3 PowerPoint export: A4 6-up or A6 1-up, matching print/PDF appearance.
(function(){
  function recs(){try{return qrPageSource.slice().sort((a,b)=>String(a.id||"").localeCompare(String(b.id||"")));}catch{return [];}}catch{return [];}}
  function ck(id,d){const e=document.getElementById(id);return e?e.checked:d;}
  function qrData(id,size){
    const h=document.createElement("div"); h.style.cssText="position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(h);
    new QRCode(h,{text:id,width:size,height:size,correctLevel:QRCode.CorrectLevel.M});
    const c=h.querySelector("canvas"),im=h.querySelector("img");
    const d=c?c.toDataURL("image/png"):(im?im.src:""); h.remove(); return d;
  }
  function txt(slide,text,x,y,w,h,fs,bold,color){
    if(!text)return y;
    slide.addText(String(text),{x,y,w,h,fontFace:"Arial",fontSize:fs,bold:!!bold,color:color||"222222",
      align:"center",valign:"mid",margin:0,fit:"shrink",breakLine:false});
    return y+h;
  }
  async function makePpt(){
    const P=(typeof pptxgen!=="undefined")?pptxgen:(typeof PptxGenJS!=="undefined")?PptxGenJS:
      (typeof pptxgenjs!=="undefined")?pptxgenjs:null;
    if(!P){setStatus($("qrStatus"),"PowerPoint作成ライブラリを読み込めませんでした。",false);return;}
    const rr=recs(); if(!rr.length){setStatus($("qrStatus"),"先にQRコードを表示してください。",false);return;}

    const mode=document.getElementById("pptLayoutMode")?.value||"a4_6";
    const s=getSizeSettings();
    const pptx=new P();
    const isA6=mode==="a6_1";

    // A4 portrait 210 x 297 mm; A6 portrait 105 x 148 mm.
    const W=isA6?5.8268:8.2677, H=isA6?4.1339:11.6929;
    pptx.defineLayout({name:isA6?"A6L":"A4P",width:W,height:H});
    pptx.layout=isA6?"A6L":"A4P";
    pptx.author="English QR Reader"; pptx.title="QR Cards";

    const showId=ck("qrShowId",true),showEn=ck("qrShowEnglish",true),showIpa=ck("qrShowIpa",true),
      showJa=ck("qrShowJapanese",false),showJr=ck("qrShowJapaneseRead",true);

    const base=16, pt=(rem,f)=>Math.max(7,Number(rem||f)*base*.75);
    const idPt=pt(s.idSize,1.05),enPt=pt(s.englishSize,1.18),ipaPt=pt(s.ipaSize,1.05),
      jaPt=pt(s.japaneseSize,1.12),jrPt=pt(s.japaneseReadSize,1.12);
    const qrPx=Number(s.qrSize)||132;

    let per, cols, rows, mx,my,gx,gy,cw,ch;
    if(isA6){
      per=1; cols=1; rows=1; mx=.28; my=.22; gx=0; gy=0;
      cw=W-2*mx; ch=H-2*my;
    }else{
      per=6; cols=2; rows=3; mx=.38; my=.36; gx=.394; gy=.394;
      cw=(W-2*mx-gx)/2; ch=(H-2*my-2*gy)/3;
    }

    for(let st=0;st<rr.length;st+=per){
      const slide=pptx.addSlide(); slide.background={color:"FFFFFF"};
      rr.slice(st,st+per).forEach((r,i)=>{
        const col=i%cols,row=Math.floor(i/cols);
        const x=mx+col*(cw+gx),y=my+row*(ch+gy);
        slide.addShape(pptx.ShapeType.rect,{x,y,w:cw,h:ch,fill:{color:"FFFFFF"},line:{color:"000000",width:.75}});

        // Same detailed QR size setting; A6 allows a little more physical space but keeps proportional sizing.
        const reference=isA6?1.55:1.30;
        const q=Math.min(isA6?2.10:1.55,Math.max(isA6?1.0:.75,reference*(qrPx/124)));
        const qx=x+(cw-q)/2,qy=y+(isA6?.28:.14);
        const data=qrData(r.id,Math.max(300,qrPx));
        if(data)slide.addImage({data,x:qx,y:qy,w:q,h:q});

        let ty=qy+q+(isA6?.12:.07),tx=x+.10,tw=cw-.20;
        const mult=isA6?1.15:1;
        if(showId){ty=txt(slide,r.id,tx,ty,tw,isA6?.30:.22,idPt*mult,true,"222222")+.01;}
        if(showEn){ty=txt(slide,r.english,tx,ty,tw,isA6?.52:.38,enPt*mult,true,"222222")+.02;}
        if(showIpa&&r.ipa){ty=txt(slide,r.ipa,tx,ty,tw,isA6?.38:.28,ipaPt*mult,false,"40506A")+.01;}
        if(showJa&&r.japanese){ty=txt(slide,r.japanese,tx,ty,tw,isA6?.42:.30,jaPt*mult,false,"555555")+.01;}
        if(showJr&&(r.japaneseRead||r.japanese)){ty=txt(slide,r.japaneseRead||r.japanese,tx,ty,tw,isA6?.42:.30,jrPt*mult,false,"555555")+.01;}
      });
    }
    setStatus($("qrStatus"),"PowerPointを作成中です…");
    await pptx.writeFile({fileName:`qr_cards_${isA6?"A6_1up":"A4_6up"}_${new Date().toISOString().slice(0,10)}.pptx`});
    setStatus($("qrStatus"),`PowerPointを作成しました（${isA6?"A6・1枚1個":"A4・1枚6個"}）。`);
  }
  window.addEventListener("load",()=>{
    const old=document.getElementById("pptBtn");if(!old)return;
    const b=old.cloneNode(true);old.parentNode.replaceChild(b,old);b.addEventListener("click",makePpt);
  });
})();