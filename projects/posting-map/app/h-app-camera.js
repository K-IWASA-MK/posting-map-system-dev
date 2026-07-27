/**
 * POSTING MAP H-app Camera & Photo Module
 * Handles camera invocation, canvas image compression (1200px / 150-300KB), and Base64 encoding
 */
(function(window) {
  function compressImage(file, maxLen = 1200, quality = 0.6) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxLen) {
              height = Math.round((height * maxLen) / width);
              width = maxLen;
            }
          } else {
            if (height > maxLen) {
              width = Math.round((width * maxLen) / height);
              height = maxLen;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              console.log(`[H-app Camera] Compressed image: ${(blob.size / 1024).toFixed(1)} KB`);
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob returned null"));
            }
          }, "image/jpeg", quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function capturePhoto(inputId = 'camera-input') {
    return new Promise((resolve) => {
      let input = document.getElementById(inputId);
      if (!input) {
        // もし存在しなければ動的に作成
        input = document.createElement('input');
        input.type = 'file';
        input.id = inputId;
        input.accept = 'image/*';
        input.capture = 'environment';
        input.style.display = 'none';
        document.body.appendChild(input);
      }

      const onFileChange = async (e) => {
        input.removeEventListener('change', onFileChange);
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        try {
          const compressedBlob = await compressImage(file);
          const base64Str = await blobToBase64(compressedBlob);
          resolve({ blob: compressedBlob, base64: base64Str });
        } catch (err) {
          console.error("[H-app Camera] Compression error, fallback to original:", err);
          const base64Str = await blobToBase64(file);
          resolve({ blob: file, base64: base64Str });
        } finally {
          input.value = '';
        }
      };

      input.addEventListener('change', onFileChange);
      input.click();
    });
  }

  window.HAppCamera = {
    capturePhoto,
    compressImage,
    blobToBase64
  };
})(window);
