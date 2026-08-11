// v2.3.0 PowerPoint export: mirror print/PDF QR-card appearance.
(function(){
  const W=8.2677,H=11.6929; // A4 portrait
  function recs(){
    try{return qrPageSource.slice(qrPageStart,qrPageStart+qrPageSize);}catch{return [];}
  }
  function ck(id,d){const e=document.getElementById(id);return e?e.checked:d;}
  function qrData(id,size){
    const h=document.createElement("div");
    h.style.cssText="position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(h);
    new QRCode(h,{text:id,width:size,height:size,correctLevel:QRCode.CorrectLevel.M});
    const c=h.querySelector("canvas"),im=h.querySelector("img");
    const d=c?c.toDataURL("image/png"):(im?im.src:"");
    h.remove(); return d;
  }
  function txt(slide,text,x,y,w,h,fs,bold,color){
    if(!text)return y;
    slide.addText(String(text),{
      x,y,w,h,fontFace:"Arial",fontSize:fs,bold:!!bold,color:color||"222222",
      align:"center",valign:"mid",margin:0,fit:"shrink",breakLine:false
    });
    return y+h;
  }
  async function makePpt(){
    const P=(typeof pptxgen!=="undefined")?pptxgen:
      (typeof PptxGenJS!=="undefined")?PptxGenJS:
      (typeof pptxgenjs!=="undefined")?pptxgenjs:null;
    if(!P){setStatus($("qrStatus"),"PowerPoint作成ライブラリを読み込めませんでした。",false);return;}
    const rr=recs();
    if(!rr.length){setStatus($("qrStatus"),"先にQRコードを表示してください。",false);return;}

    const s=getSizeSettings();
    const pptx=new P();
    pptx.defineLayout({name:"A4P",width:W,height:H}); pptx.layout="A4P";
    pptx.author="English QR Reader"; pptx.title="QR Cards";

    const showId=ck("qrShowId",true), showEn=ck("qrShowEnglish",true),
          showIpa=ck("qrShowIpa",true), showJa=ck("qrShowJapanese",false),
          showJr=ck("qrShowJapaneseRead",true);

    // Same overall geometry as print/PDF: A4 portrait, 2 columns, 10 mm gaps.
    const mx=.38,my=.36,gx=.394,gy=.394,cols=2,rows=3,per=6;
    const cw=(W-2*mx-gx)/2, ch=(H-2*my-2*gy)/3;

    // Convert current screen rem settings proportionally to PowerPoint points.
    const base=16;
    const pt=(rem, fallback)=>Math.max(7, Number(rem||fallback)*base*0.75);
    const idPt=pt(s.idSize,1.05), enPt=pt(s.englishSize,1.18),
          ipaPt=pt(s.ipaSize,1.05), jaPt=pt(s.japaneseSize,1.12),
          jrPt=pt(s.japaneseReadSize,1.12);

    for(let st=0;st<rr.length;st+=per){
      const slide=pptx.addSlide(); slide.background={color:"FFFFFF"};
      rr.slice(st,st+per).forEach((r,i)=>{
        const col=i%2,row=Math.floor(i/2),x=mx+col*(cw+gx),y=my+row*(ch+gy);
        slide.addShape(pptx.ShapeType.rect,{
          x,y,w:cw,h:ch,fill:{color:"FFFFFF"},line:{color:"000000",width:.75}
        });

        // Match the current detailed QR size setting to the print/PDF layout.
        // 124 px is the print reference size; convert proportionally to inches.
        const qrPx=Number(s.qrSize)||132;
        const q=Math.min(1.55,Math.max(.75,1.30*(qrPx/124)));
        const qx=x+(cw-q)/2,qy=y+.14;
        const data=qrData(r.id,Math.max(300,qrPx));
        if(data)slide.addImage({data,x:qx,y:qy,w:q,h:q});

        let ty=qy+q+.07, tx=x+.10, tw=cw-.20;
        if(showId){ty=txt(slide,r.id,tx,ty,tw,.22,idPt,true,"222222")+.01;}
        if(showEn){ty=txt(slide,r.english,tx,ty,tw,.38,enPt,true,"222222")+.01;}
        if(showIpa&&r.ipa){ty=txt(slide,r.ipa,tx,ty,tw,.28,ipaPt,false,"40506A")+.01;}
        if(showJa&&r.japanese){ty=txt(slide,r.japanese,tx,ty,tw,.30,jaPt,false,"555555")+.01;}
        if(showJr&&(r.japaneseRead||r.japanese)){
          ty=txt(slide,r.japaneseRead||r.japanese,tx,ty,tw,.30,jrPt,false,"555555")+.01;
        }
      });
    }
    setStatus($("qrStatus"),"PowerPointを作成中です…");
    await pptx.writeFile({fileName:`qr_cards_${new Date().toISOString().slice(0,10)}.pptx`});
    setStatus($("qrStatus"),"PowerPointを作成しました。");
  }

  window.addEventListener("load",()=>{
    const old=document.getElementById("pptBtn"); if(!old)return;
    const b=old.cloneNode(true); old.parentNode.replaceChild(b,old);
    b.addEventListener("click",makePpt);
  });
})();