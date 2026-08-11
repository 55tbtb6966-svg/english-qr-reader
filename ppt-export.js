// Minimal local PowerPoint export for English QR Reader.
// No external CDN. Data stays in the browser.
(function(){
  const EMU_PER_IN = 914400;
  const SLIDE_W = 13.333 * EMU_PER_IN;
  const SLIDE_H = 7.5 * EMU_PER_IN;
  const NS_A="http://schemas.openxmlformats.org/drawingml/2006/main";
  const NS_P="http://schemas.openxmlformats.org/presentationml/2006/main";
  const NS_R="http://schemas.openxmlformats.org/officeDocument/2006/relationships";

  function encXml(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
  function u16(n){return [n&255,(n>>>8)&255];}
  function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];}
  function crc32(bytes){let c=~0;for(let i=0;i<bytes.length;i++){c^=bytes[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return (~c)>>>0;}
  function zip(files){
    const te=new TextEncoder(); let chunks=[], central=[], offset=0;
    for(const f of files){
      const name=te.encode(f.name); const data=f.bytes instanceof Uint8Array?f.bytes:te.encode(f.bytes); const crc=crc32(data);
      const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0)]);
      chunks.push(local,name,data);
      const cen=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
      central.push(cen,name); offset += local.length+name.length+data.length;
    }
    const cStart=offset; for(const c of central){chunks.push(c); offset+=c.length;} const cSize=offset-cStart;
    chunks.push(new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(cSize),...u32(cStart),...u16(0)]));
    return new Blob(chunks,{type:"application/vnd.openxmlformats-officedocument.presentationml.presentation"});
  }
  function dataUrlBytes(url){const b64=url.split(',')[1]||'';const bin=atob(b64);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
  function qrPng(id){
    const holder=document.createElement('div'); holder.style.cssText='position:fixed;left:-9999px;top:-9999px'; document.body.appendChild(holder);
    new QRCode(holder,{text:id,width:420,height:420,correctLevel:QRCode.CorrectLevel.M});
    const canvas=holder.querySelector('canvas'); const img=holder.querySelector('img');
    const url=canvas?canvas.toDataURL('image/png'):(img?img.src:''); document.body.removeChild(holder); return url;
  }
  function pic(id,rid,x,y,w,h){return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="QR ${id}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId${rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${Math.round(x)}" y="${Math.round(y)}"/><a:ext cx="${Math.round(w)}" cy="${Math.round(h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;}
  function text(id,x,y,w,h,s,pt,bold=false,color="222222"){
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Text ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${Math.round(x)}" y="${Math.round(y)}"/><a:ext cx="${Math.round(w)}" cy="${Math.round(h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-US" sz="${Math.round(pt*100)}"${bold?' b="1"':''}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:rPr><a:t>${encXml(s)}</a:t></a:r><a:endParaRPr lang="en-US" sz="${Math.round(pt*100)}"/></a:p></p:txBody></p:sp>`;
  }
  function currentRecords(){return (typeof qrPageSource!=='undefined'&&qrPageSource.length)?qrPageSource.slice(qrPageStart,qrPageStart+qrPageSize):[];}
  async function exportPpt(){
    const records=currentRecords();
    if(!records.length){setStatus($("qrStatus"),"先にQRコードを表示してください。",false);return;}
    setStatus($("qrStatus"),"PowerPointを作成中です…");
    const showId=$("qrShowId")?.checked!==false, showEn=$("qrShowEnglish")?.checked!==false, showIpa=$("qrShowIpa")?.checked!==false, showJa=$("qrShowJapanese")?.checked===true, showRead=$("qrShowJapaneseRead")?.checked!==false;
    const cols=records.length<=6?2:records.length<=12?3:4; const rows=Math.ceil(records.length/cols);
    const mx=360000,my=300000,gx=160000,gy=130000; const cw=(SLIDE_W-mx*2-gx*(cols-1))/cols; const ch=(SLIDE_H-my*2-gy*(rows-1))/rows; const q=Math.min(cw*0.42,ch*0.55,1050000);
    let files=[],rels=[],shapes=[],sid=2,mid=1;
    records.forEach((r,i)=>{
      const col=i%cols,row=Math.floor(i/cols),x=mx+col*(cw+gx),y=my+row*(ch+gy),qx=x+(cw-q)/2,qy=y+70000;
      const url=qrPng(r.id); if(url){files.push({name:`ppt/media/image${mid}.png`,bytes:dataUrlBytes(url)}); rels.push(`<Relationship Id="rId${mid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${mid}.png"/>`); shapes.push(pic(sid++,mid,qx,qy,q,q)); mid++;}
      let ty=qy+q+45000; const line=(s,pt,b=false,c="222222")=>{if(!s)return;shapes.push(text(sid++,x+40000,ty,cw-80000,210000,s,pt,b,c));ty+=210000;};
      if(showId)line(r.id,12,false,"555555"); if(showEn)line(r.english,18,true,"111111"); if(showIpa&&r.ipa)line(r.ipa,13,false,"40506A"); if(showJa&&r.japanese)line(r.japanese,14,false,"333333"); if(showRead&&(r.japaneseRead||r.japanese))line(r.japaneseRead||r.japanese,15,false,"333333");
    });
    const slide=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes.join('')}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
    const slideRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`;
    const base=[
      {name:'[Content_Types].xml',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`},
      {name:'_rels/.rels',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`},
      {name:'docProps/core.xml',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>QR Cards</dc:title><dc:creator>English QR Reader</dc:creator></cp:coreProperties>`},
      {name:'docProps/app.xml',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>English QR Reader</Application></Properties>`},
      {name:'ppt/presentation.xml',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst><p:sldSz cx="12192000" cy="6858000" type="wide"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`},
      {name:'ppt/_rels/presentation.xml.rels',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/></Relationships>`},
      {name:'ppt/slides/slide1.xml',bytes:slide},{name:'ppt/slides/_rels/slide1.xml.rels',bytes:slideRels},
      {name:'ppt/slideMasters/slideMaster1.xml',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`},
      {name:'ppt/slideMasters/_rels/slideMaster1.xml.rels',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`},
      {name:'ppt/slideLayouts/slideLayout1.xml',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}" type="blank"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`},
      {name:'ppt/slideLayouts/_rels/slideLayout1.xml.rels',bytes:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`},
      ...files
    ];
    const blob=zip(base); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`qr_cards_${new Date().toISOString().slice(0,10)}.pptx`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    setStatus($("qrStatus"),`PowerPointを作成しました（${records.length}件）。`);
  }
  window.addEventListener('load',()=>{$("pptBtn")?.addEventListener('click',exportPpt);});
})();
