// Selectam elementele din pagina
const button = document.getElementById("fetch-image");
const jsonContainer = document.getElementById("json-container");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const timeContainer = document.getElementById("time-container");

// Functia care aduce imaginea de la API
async function fetchImage() {
  const response = await fetch("https://dog.ceo/api/breeds/image/random");
  const data = await response.json();

  // Afisam JSON-ul intr-un format frumos
  jsonContainer.innerHTML = `
    <div><strong>Message:</strong> <a href="${data.message}" target="_blank">${data.message}</a></div>
    <div><strong>Status:</strong> <span style="color: green;">${data.status}</span></div>
  `;

  // Cream imaginea
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = data.message;

  // Desenam imaginea cand este gata
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Aplicam efectele cu delay
    setTimeout(() => {
      const mirrorStart = performance.now(); // Incepem masurarea timpului pentru mirror
      mirrorImage(() => {
        const mirrorEnd = performance.now();
        const mirrorTime = (mirrorEnd - mirrorStart).toFixed(2);

        // Afisam timpul pentru mirror
        timeContainer.innerHTML = `<p>Mirror Execution Time: ${mirrorTime} ms</p>`;

        // Procesare grayscale dupa mirror
        setTimeout(() => {
          const grayscaleStart = performance.now(); // Incepem masurarea timpului pentru grayscale
          processGrayscaleInSlices(() => {
            const grayscaleEnd = performance.now();
            const grayscaleTime = (grayscaleEnd - grayscaleStart).toFixed(2);

            // Afisam timpul total pentru grayscale
            timeContainer.innerHTML += `<p>Total Grayscale Execution Time: ${grayscaleTime} ms</p>`;
          });
        }, 1000);
      });
    }, 1000);
  };
}

// Functia care aplica efectul de mirror
function mirrorImage(callback) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width / 2; x++) {
      const leftIndex = (y * canvas.width + x) * 4;
      const rightIndex = (y * canvas.width + (canvas.width - x - 1)) * 4;

      for (let i = 0; i < 4; i++) {
        const temp = pixels[leftIndex + i];
        pixels[leftIndex + i] = pixels[rightIndex + i];
        pixels[rightIndex + i] = temp;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  console.log("Mirror aplicat.");
  if (callback) callback(); // Apelam callback-ul dupa finalizarea mirror-ului
}

// Functia care proceseaza imaginea in grayscale pe 4 felii
function processGrayscaleInSlices(callback) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const sliceHeight = Math.ceil(canvas.height / 4);

  let slicesProcessed = 0;

  for (let i = 0; i < 4; i++) {
    const sliceStart = performance.now(); // Incepem masurarea timpului pentru felia curenta

    setTimeout(() => {
      processSlice(pixels, i * sliceHeight, sliceHeight, canvas.width);

      // Actualizam canvas-ul dupa fiecare felie
      ctx.putImageData(imageData, 0, 0);
      console.log(`Felie ${i + 1} procesata.`);

      const sliceEnd = performance.now(); // Finalizam masurarea timpului pentru felia curenta
      const sliceTime = (sliceEnd - sliceStart).toFixed(2);

      // Afisam timpul pentru felia curenta
      timeContainer.innerHTML += `<p>Slice ${
        i + 1
      } Execution Time: ${sliceTime} ms</p>`;

      slicesProcessed++;
      if (slicesProcessed === 4 && callback) callback(); // Apelam callback-ul la final
    }, i * 1000); // Fiecare felie este procesata cu un delay de 1 secunda
  }
}

// Functia care proceseaza o singura felie in grayscale
function processSlice(pixels, startY, sliceHeight, width) {
  for (let y = startY; y < startY + sliceHeight && y < canvas.height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;

      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];

      const gray = (r + g + b) / 3;

      pixels[index] = gray;
      pixels[index + 1] = gray;
      pixels[index + 2] = gray;
    }
  }
}

// Eveniment pe buton
button.addEventListener("click", fetchImage);
