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

self.addEventListener('message', function (e) {
  console.log(e.data)
  const {result} = e.data
  const psd = PSD.fromBuffer(result); // 解析二进制数据
  const tree = psd.tree().export(); 
  console.log(psd,tree)

  // eslint-disable-next-line no-undef
  const preview ='data:image/png;base64,'+ _arrayBufferToBase64(UPNG.encode(
            [psd.image.pixelArrayBuffer.buffer],
            psd.image.width(),
            psd.image.height(),
            0,
          ),
          )

  console.log('preview',preview)
  
 },false)

