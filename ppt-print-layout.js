// PowerPoint export matching the app's print/PDF QR-card layout as closely as practical.
(function(){
  const SLIDE_W = 8.2677;   // A4 portrait width in inches
  const SLIDE_H = 11.6929;  // A4 portrait height in inches

  function getRecords(){
    try{
      if(qrPageSource && qrPageSource.length){
        return qrPageSource.slice(qrPageStart, qrPageStart + qrPageSize);
      }
    }catch{}
    return [];
  }

  function checked(id, def){
    const el=document.getElementById(id);
    return el ? el.checked : def;
  }

  function qrDataUrl(id, size=620){
    const h=document.createElement("div");
    h.style.cssText="position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(h);
    new QRCode(h,{text:id,width:size,height:size,correctLevel:QRCode.CorrectLevel.M});
    const c=h.querySelector("canvas"), im=h.querySelector("img");
    const d=c?c.toDataURL("image/png"):(im?im.src:"");
    h.remove();
    return d;
  }

  function addText(slide, text, x, y, w, h, fs, bold=false, color="222222"){
    if(!text)return y;
    slide.addText(String(text),{
      x, y, w, h,
      fontFace:"Arial",
      fontSize:fs,
      bold:!!bold,
      color,
      align:"center",
      valign:"mid",
      margin:0,
      fit:"shrink",
      breakLine:false,
    });
    return y+h;
  }

  async function exportPrintLayoutPpt(){
    const P=(typeof pptxgen!=="undefined")?pptxgen:
            (typeof PptxGenJS!=="undefined")?PptxGenJS:
            (typeof pptxgenjs!=="undefined")?pptxgenjs:null;
    if(!P){
      setStatus($("qrStatus"),"PowerPoint作成ライブラリを読み込めませんでした。",false);
      return;
    }

    const records=getRecords();
    if(!records.length){
      setStatus($("qrStatus"),"先にQRコードを表示してください。",false);
      return;
    }

    const showId=checked("qrShowId",true);
    const showEnglish=checked("qrShowEnglish",true);
    const showIpa=checked("qrShowIpa",true);
    const showJapanese=checked("qrShowJapanese",false);
    const showJapaneseRead=checked("qrShowJapaneseRead",true);

    const pptx=new P();
    pptx.defineLayout({name:"A4P",width:SLIDE_W,height:SLIDE_H});
    pptx.layout="A4P";
    pptx.author="English QR Reader";
    pptx.subject="QR cards";
    pptx.title="QR cards";

    // Safari print/PDF uses A4 portrait, 2 columns and 10mm gaps.
    // Browser print margins vary, so these values visually match the current PDF output.
    const cols=2;
    const rows=3;
    const perSlide=6;
    const marginX=0.38;   // close to default print margin feel
    const marginY=0.36;
    const gapX=0.40;      // 10mm
    const gapY=0.40;
    const cardW=(SLIDE_W - marginX*2 - gapX) / 2;
    const cardH=(SLIDE_H - marginY*2 - gapY*2) / 3;

    for(let start=0; start<records.length; start+=perSlide){
      const slide=pptx.addSlide();
      slide.background={color:"FFFFFF"};
      const page=records.slice(start,start+perSlide);

      page.forEach((r,i)=>{
        const col=i%cols;
        const row=Math.floor(i/cols);
        const x=marginX + col*(cardW+gapX);
        const y=marginY + row*(cardH+gapY);

        // PDF card: simple black border, no fill decoration.
        slide.addShape(pptx.ShapeType.rect,{
          x, y, w:cardW, h:cardH,
          fill:{color:"FFFFFF", transparency:100},
          line:{color:"000000", width:0.75},
        });

        // PDF print QR: about 124px. This is visually similar on A4.
        const q=1.32;
        const qx=x+(cardW-q)/2;
        const qy=y+0.15;
        const data=qrDataUrl(r.id,620);
        if(data){
          slide.addImage({data, x:qx, y:qy, w:q, h:q});
        }

        // Match PDF typography: compact, centered, English bold.
        let ty=qy+q+0.08;
        const tx=x+0.12;
        const tw=cardW-0.24;

        if(showId){
          ty = addText(slide, r.id, tx, ty, tw, 0.22, 9.5, true, "222222") + 0.01;
        }
        if(showEnglish){
          ty = addText(slide, r.english, tx, ty, tw, 0.38, 12.2, true, "222222") + 0.02;
        }
        if(showIpa && r.ipa){
          ty = addText(slide, r.ipa, tx, ty, tw, 0.25, 9.8, false, "40506A") + 0.01;
        }
        if(showJapanese && r.japanese){
          ty = addText(slide, r.japanese, tx, ty, tw, 0.27, 10.8, false, "555555") + 0.01;
        }
        if(showJapaneseRead && (r.japaneseRead || r.japanese)){
          ty = addText(slide, r.japaneseRead || r.japanese, tx, ty, tw, 0.27, 10.8, false, "555555") + 0.01;
        }
      });
    }

    setStatus($("qrStatus"),"PowerPointを作成中です…");
    await pptx.writeFile({fileName:`qr_cards_print_layout_${new Date().toISOString().slice(0,10)}.pptx`});
    setStatus($("qrStatus"),"PowerPointを作成しました。");
  }

  window.addEventListener("load",()=>{
    const old=document.getElementById("pptBtn");
    if(!old)return;
    const b=old.cloneNode(true);
    old.parentNode.replaceChild(b,old);
    b.addEventListener("click",exportPrintLayoutPpt);
  });
})();
