// import PSD from 'psd'
// eslint-disable-next-line no-undef
importScripts('psd.js','UPNG.js','pako.js');
const PSD = require('psd');
// import PSD from 'psd'

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
  return  'data:image/png;base64,'+ _arrayBufferToBase64(UPNG.encode(
            [image.pixelArrayBuffer.buffer],
            image.width(),
            image.height(),
            0,
          ),
          )
}

self.addEventListener('message', function (e) {
  const {result} = e.data
  const psd = PSD.fromBuffer(result); // 解析二进制数据

  console.log(psd)


  const layer = psd.layers[1]




  

  //  eslint-disable-next-line no-undef
  // const back = 'data:image/png;base64,'+ _arrayBufferToBase64(UPNG.encode(
  //           [image.pixelArrayBuffer.buffer],
  //           image.width(),
  //           image.height(),
  //           0,
  //         ),
  // )

  // console.log(back)  



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

  const origin = layer.vectorOrigination()
  const mask = layer.vectorMask()
  const solidColor = layer.solidColor()

  console.log('layer',layer,origin,mask,solidColor)

  
  
  


  // self.postMessage(data)

  // console.log('png',psd , layer)

  // eslint-disable-next-line no-undef
  // const preview ='data:image/png;base64,'+ _arrayBufferToBase64(UPNG.encode(
  //           [psd.image.pixelArrayBuffer.buffer],
  //           psd.image.width(),
  //           psd.image.height(),
  //           0,
  //         ),
          // )


  

  // console.log('preview',preview)

  
 },false)

