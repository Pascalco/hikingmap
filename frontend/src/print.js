import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';

//see https://html2canvas.hertzen.com/configuration
const exportOptions = {
  useCORS: true,
  ignoreElements: function (element) {
    const className = element.className || '';
    return !(
      className.indexOf('ol-control') === -1 ||
      className.indexOf('ol-scale') > -1 ||
      (className.indexOf('ol-attribution') > -1 && className.indexOf('ol-uncollapsible'))
    );
  },
};

const createPdf = () => {
  html2canvas(document.getElementById('map'), exportOptions).then(canvas => {
    console.log(canvas.width, canvas.height);
    let width = 287;
    let height = (width / canvas.width) * canvas.height;
    if (height > 200) {
      height = 200;
      width = (height / canvas.height) * canvas.width;
    }
    console.log(width, height);
    const xOffset = parseInt((297 - width) / 2);
    const yOffset = parseInt((210 - height) / 2);
    const pdf = new jsPDF('landscape', undefined, 'A4');
    pdf.addImage(canvas, 'JPEG', xOffset, yOffset, width, height);
    pdf.save('map.pdf');
  });
};

export {createPdf};
