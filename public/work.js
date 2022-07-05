// import PSD from 'psd'
// eslint-disable-next-line no-undef
importScripts('UPNG.js', 'pako.js', 'psd.js');
const PSD = require('psd');


// 二进制转base64
const _arrayBufferToBase64 = buffer => {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return this.self.btoa(binary);
};


const toBase64 = (image) => {
  // eslint-disable-next-line no-undef
  return 'data:image/png;base64,' + _arrayBufferToBase64(UPNG.encode(
    [image.pixelArrayBuffer.buffer],
    image.width(),
    image.height(),
    0,
  ),
  )
}

self.addEventListener('message', async function (e) {

  const psd = PSD.fromBuffer(e.data.result); // 解析二进制数据
   const { children, document: doc } = psd.tree().export();

  console.log(children,doc,psd)


  // const layer = psd.layers[1]


  // const  storke = layer.vectorStroke()
  // const content = layer.vectorStrokeContent()
  // console.log('storke',storke)
  // console.log('content',content)
  // const {strokeStyleContent,strokeStyleLineWidth,strokeStyleLineDashSet,strokeStyleOpacity} = storke.data

  // const Clr =  strokeStyleContent['Clr ']

  // const storkeColor =`rgb(${Clr["Rd  "]},${Clr["Grn "]},${Clr["Bl  "]})`

  // const storkeWidth = strokeStyleLineWidth.value

  // const storkeOpacity = strokeStyleOpacity.value

  // const storkeDashSet =strokeStyleLineDashSet.length? [strokeStyleLineDashSet[0].value,strokeStyleLineDashSet[1].value] : []

  // const ClrB = content.data["Clr "]
  // const r = Math.round(ClrB["Rd  "])
  // const g = Math.round(ClrB["Grn "])
  // const b = Math.round(ClrB["Bl  "])


  // const maskBackground = `rgb(${r},${g},${b})`

  // console.log(storkeColor,Clr,storkeWidth,r,g,b)

  // const data ={
  //   storkeColor,
  //   storkeWidth,
  //   storkeOpacity,
  //   storkeDashSet,
  //   maskBackground

  // }

  // const origin = layer.vectorOrigination()
  // const mask = layer.vectorMask()
  // const solidColor = layer.solidColor()

  // console.log('layer',layer,origin,mask,solidColor)

}, false)

