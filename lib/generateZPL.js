export default function generateZPL(tags) {
  const START_X = [74, 226, 378];

  // Negative = moves print DOWN on your labels
  const Y_OFFSET = -105;

  let zpl = `
^XA
^MMT
^PW487
^LL799
^LS0
`;

  tags.forEach((tag, i) => {
    const x = START_X[i] - 74;

  zpl += `

// Product Details
^FT${74 + x},255
^A0B,23,23
^CI28
^FDNW :- ${tag.netWeight} GM^FS

^FT${103 + x},255
^A0B,23,23
^CI28
^FDSKU :- ${tag.sku}^FS

^FT${132 + x},255
^A0B,23,23
^CI28
^FDBID :- ${tag.bid}^FS

// Branding
^FT${131 + x},416
^A0B,28,28
^CI28
^FD🌐📷SIVAAH.IN^FS

^FT${74 + x},519
^A0B,17,18
^FB244,1,4,C
^CI28
^FDGET upto 20% Cashback\&^FS

^FT${95 + x},519
^A0B,17,18
^FB244,1,4,C
^CI28
^FDDM Us On Instagram\&^FS

`;
  });

  zpl += `
^PQ1,0,1,Y
^XZ
`;

  return zpl;
}