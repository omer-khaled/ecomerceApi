import Path from 'path';
import dirname from './path.js';
import sharp from 'sharp';
function resizeImage(path, width, height) {
    return sharp(path).resize({
      width,
      height,
      // Preserve aspect ratio, while ensuring dimensions are <= to those specified
      fit: sharp.fit.inside,
    }).toBuffer();
  }
  
function resizingMiddleware(req, res, next)  {
    const data = req.url; // Extract data from the URI
    if (!data) { return next(); } // Could not parse the URI
    const imagePAth = data.split('/')[1];
    // Get full file path in public directory
    const path = Path.join(dirname, 'images', imagePAth);
    resizeImage(path, undefined, 250)
      .then(buffer => {
        // Success. Send the image
        res.set('Content-type', 'attachment;'); // using 'mime-types' package
        res.send(buffer);
      })
      .catch(next); // File not found or resizing failed
}

export default resizingMiddleware;