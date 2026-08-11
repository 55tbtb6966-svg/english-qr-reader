// PowerPoint export matching the app's print/PDF QR-card layout.
(function(){
  function getRecords(){
    try{
      if(qrPageSource && qrPageSource.length){
        return qrPageSource.slice(qrPageStart, qrPageStart + qrPageSize);
      }
    }catch{}
    return [];
  }
  function checked(id,def){
    const el=document.getElementById(id);
    return el ? el.checked : def;
  }
  function qrDataUrl(id,size=520){
    const h=document.createElement("div");
    h.style.cssText="position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(h);
    new QRCode(h,{text:id,width:size,height:size,correctLevel:QRCode.CorrectLevel.M});
    const c=h.querySelector("canvas"), im=h.querySelector("img");
    const d=c?c.toDataURL("image/png"):(im?im.src:"");
    h.remove(); return d;
  }
  function addText(slide,text,x,y,w,h,fs,bold,color){
    if(!text)return;
    slide.addText(String(text),{
      x,y,w,h,fontFace:"Aptos",fontSize:fs,bold:!!bold,color:color||"222222",
      align:"center",valign:"mid",margin:0.02,fit:"shrink",breakLine:false
    });
  }
  async function exportPrintLayoutPpt(){
    const P=(typeof pptxgen!=="undefined")?pptxgen:
            (typeof PptxGenJS!=="undefined")?PptxGenJS:
            (typeof pptxgenjs!=="undefined")?pptxgenjs:null;
    if(!P){
      setStatus($("qrStatus"),"PowerPoint作成ライブラリを読み込めませんでした。",false); return;
    }
    const records=getRecords();
    if(!records.length){setStatus($("qrStatus"),"先にQRコードを表示してください。",false);return;}

    const pptx=new P();
    // Print/PDF is portrait, two columns. Use custom A4 ratio.
    pptx.defineLayout({name:"A4P",width:8.2677,height:11.6929});
    pptx.layout="A4P";
    pptx.author="English QR Reader";
    pptx.title="QR Cards";

    const showId=checked("qrShowId",true);
    const showEnglish=checked("qrShowEnglish",true);
    const showIpa=checked("qrShowIpa",true);
    const showJapanese=checked("qrShowJapanese",false);
    const showJapaneseRead=checked("qrShowJapaneseRead",true);

    // CSS print layout: 2 columns, 10mm gap, 124px QR.
    // Reproduce the same visual ratio on A4 portrait.
    const cols=2;
    const marginX=0.36, marginY=0.34, gapX=0.394, gapY=0.394;
    const cardW=(8.2677-marginX*2-gapX)/2;
    // 6 cards/page (2 x 3) best matches current print card proportions.
    const rows=3, perSlide=6;
    const cardH=(11.6929-marginY*2-gapY*(rows-1))/rows;

    for(let start=0;start<records.length;start+=perSlide){
      const slide=pptx.addSlide();
      slide.background={color:"FFFFFF"};
      const page=records.slice(start,start+perSlide);
      page.forEach((r,i)=>{
        const col=i%2,row=Math.floor(i/2);
        const x=marginX+col*(cardW+gapX);
        const y=marginY+row*(cardH+gapY);

        // print .qrCard: black 1px border, rounded screen radius is retained visually
        slide.addShape(pptx.ShapeType.roundRect,{
          x,y,w:cardW,h:cardH,
          rectRadius:0.08,
          fill:{color:"FFFFFF"},
          line:{color:"000000",width:0.75}
        });

        // print QR is 124px; use similar fraction of card width.
        const q=1.30;
        const qx=x+(cardW-q)/2;
        const qy=y+0.14;
        const data=qrDataUrl(r.id);
        if(data)slide.addImage({data,x:qx,y:qy,w:q,h:q});

        let ty=qy+q+0.08;
        if(showId){addText(slide,r.id,x+0.10,ty,cardW-0.20,0.24,10,true,"222222");ty+=0.25;}
        if(showEnglish){addText(slide,r.english,x+0.10,ty,cardW-0.20,0.31,12,true,"222222");ty+=0.32;}
        if(showIpa&&r.ipa){addText(slide,r.ipa,x+0.10,ty,cardW-0.20,0.27,10,false,"40506A");ty+=0.28;}
        if(showJapanese&&r.japanese){addText(slide,r.japanese,x+0.10,ty,cardW-0.20,0.29,11,false,"555555");ty+=0.30;}
        if(showJapaneseRead&&(r.japaneseRead||r.japanese)){
          addText(slide,r.japaneseRead||r.japanese,x+0.10,ty,cardW-0.20,0.29,11,false,"555555");
        }
      });
    }
    setStatus($("qrStatus"),"印刷/PDFと同じレイアウトでPowerPointを作成中です…");
    await pptx.writeFile({fileName:`qr_cards_print_layout_${new Date().toISOString().slice(0,10)}.pptx`});
    setStatus($("qrStatus"),`PowerPointを作成しました（印刷/PDFと同じ2列レイアウト）。`);
  }

  window.addEventListener("load",()=>{
    const old=document.getElementById("pptBtn");
    if(!old)return;
    const b=old.cloneNode(true);
    old.parentNode.replaceChild(b,old);
    b.addEventListener("click",exportPrintLayoutPpt);
  });
})();