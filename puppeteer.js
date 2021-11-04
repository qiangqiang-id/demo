
const puppeteer = require('puppeteer');

const GIFEncoder = require('gifencoder');

const fs = require('fs');
const { createCanvas, loadImage  } = require('canvas');// createImageData

const encoder = new GIFEncoder(400, 400);
// stream the results as they are available into myanimated.gif
encoder.createReadStream().pipe(fs.createWriteStream('myanimated.gif'));

encoder.start();
encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
encoder.setDelay(0);  // frame delay in ms
encoder.setQuality(100); 

const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');


// // red rectangle
// ctx.fillStyle = '#ff0000';
// ctx.fillRect(0, 0, 320, 240);
// encoder.addFrame(ctx);

// // green rectangle
// ctx.fillStyle = '#00ff00';
// ctx.fillRect(0, 0, 320, 240);
// encoder.addFrame(ctx);

// // blue rectangle
// ctx.fillStyle = '#0000ff';
// ctx.fillRect(0, 0, 320, 240);
// encoder.addFrame(ctx);

// encoder.finish();

let index = 100;
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ // 设置视窗大小
    width: 600,
    height: 800
    });
    await page.goto('http://172.18.171.210:8080/'); // 打开页面
    const container = await page.$('#image-container');
    while(index) {
        index -= 4;
        const frame = await container.screenshot({ type: 'png', path: `example${index}.png` });
        console.log('frame: ', frame);
        const image = await loadImage(`example${index}.png`)
        ctx.drawImage(image, 0, 0);
        encoder.addFrame(ctx);
    }

    // while(index) {
    //     index -= 10;
    //     const frame = await container.screenshot({ type: 'png' });
    //     console.log('frame: ', frame);
    //     // const u16a = Uint16Array.from(frame)
    //     // console.log('u16a: ', u16a);
    //     // const image = await createImageData(u16a, 400, 400)
    //     // console.log('image: ', image);
    //     // ctx.drawImage(image, 0, 0);
    //     encoder.addFrame(frame);
    // }

    encoder.finish();
    
 
    await browser.close();

})();